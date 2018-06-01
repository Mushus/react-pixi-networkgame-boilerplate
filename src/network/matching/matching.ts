import ServerConnection, {
  ConnectionEvent as ServerEvent,
  ResponseUser,
  ResponseParty
} from '@/network/server';
import PlayerConnection, {
  ConnectionEvent as PlayerEvent
} from '@/network/player';

export enum MatchingEvent {
  ConnectServer = 'connect_server',
  Update = 'update'
}

export class Matching {
  _serverConnection: ServerConnection;
  _me: User;
  _party: Party;
  _event: {
    [key: string]: { func: ((event: any) => void); once: boolean }[];
  } = {
    [MatchingEvent.ConnectServer]: [],
    [MatchingEvent.Update]: []
  };

  constructor(wsUrl: string, userName: string) {
    const conn = new ServerConnection(wsUrl, userName);
    this._serverConnection = conn;
    conn.once(ServerEvent.Open, () => {
      this._handle(MatchingEvent.ConnectServer, null);
    });
    conn.once(ServerEvent.CreateUser, (user: ResponseUser) => {
      this._me = new Me(user);
    });
    conn.on(ServerEvent.ModifyParty, party => {
      this._party.update(party, this);
      this._handle(MatchingEvent.Update, this._party.toObject());
    });
  }

  async createParty(isPrivate: boolean, maxUsers: number) {
    const partyData = await this._serverConnection.createParty(
      isPrivate,
      maxUsers
    );
    this._party = new Party(partyData, this._me, this);
    this._handle(MatchingEvent.Update, this._party.toObject());
  }

  async joinParty(partyId: string) {
    const partyData = await this._serverConnection.joinParty(partyId);
    this._party = new Party(partyData, this._me, this);
    this._handle(MatchingEvent.Update, this._party.toObject());
  }

  _createPlayerConnection(userId: string) {
    const pc = new PlayerConnection(this._serverConnection, userId);
    pc.on(PlayerEvent.Connect, () => {
      this._handle(MatchingEvent.Update, this._party.toObject());
    });
    return pc;
  }

  get me() {
    return this._me;
  }

  dispose() {
    this._serverConnection.dispose();
    this._party.dispose();
    this._me.dispose();
    this._event = null;
  }

  on(handler: MatchingEvent, func: (data: any) => void = null) {
    this._event[handler].push({ func, once: false });
  }

  once(handler: MatchingEvent, func: (data: any) => void = null) {
    this._event[handler].push({ func, once: true });
  }

  off(handler: MatchingEvent, func: (data: any) => void) {
    const index = this._event[handler].findIndex(event => event.func == func);
    delete this._event[handler][index];
  }

  _handle<T>(handler: MatchingEvent, data: T) {
    if (!this._event[handler]) return;
    for (const event of this._event[handler]) {
      event.func(data);
    }
    this._event[handler] = this._event[handler].filter(event => !event.once);
  }
}

class Room {
  id: string;
  users: number[];
}

/**
 * パーティ情報
 */
class Party {
  id: string;
  owner: User;
  isPrivate: boolean;
  maxUsers: number;
  users: User[];

  constructor(partyData: ResponseParty, me: User, system: Matching) {
    this.users = [];
    this.users.push(me);
    this.update(partyData, system, true);
  }

  update(partyData: ResponseParty, system: Matching, initiator = false): Party {
    this.id = partyData.id;
    this.isPrivate = partyData.isPrivate;
    this.maxUsers = partyData.maxUsers;

    // ユーザーの情報のインスタンスを生成し直さないように更新する
    const newUsers: User[] = [];
    for (const userData of partyData.users) {
      const index = this.users.findIndex(user => {
        return user && user.id === userData.id;
      });
      const isFound = index !== -1;
      newUsers[newUsers.length] = isFound
        ? this.users[index].update(userData)
        : new RemoteUser(userData, system, initiator);
      delete this.users[index];
    }

    for (const i in this.users) {
      this.users[i].dispose();
    }
    this.users = newUsers;
    this.owner = newUsers.find(user => user.id === partyData.owner.id);

    return this;
  }

  dispose() {
    this.owner.dispose();
    for (const user of this.users) {
      user.dispose();
    }
  }

  toObject() {
    return {
      id: this.id,
      owner: this.owner.toObject(),
      isPrivate: this.isPrivate,
      maxUsers: this.maxUsers,
      users: this.users
    };
  }
}

/**
 * ユーザー情報
 */
interface User {
  id: string;
  update(userData: ResponseUser): User;
  dispose(): void;
  toObject(): { id: string; name: string; status: ConnectStatus };
}

enum ConnectStatus {
  Ok = 'ok',
  Ng = 'ng'
}

/**
 * リモートユーザー
 */
class RemoteUser {
  id: string;
  name: string;
  connection: PlayerConnection;
  status: ConnectStatus;

  constructor(userData: ResponseUser, system: Matching, initiator: boolean) {
    this.status = ConnectStatus.Ng;
    this.update(userData);
    this.connection = system._createPlayerConnection(this.id);
    this.connection.once(PlayerEvent.Connect, () => {
      this.status = ConnectStatus.Ok;
    });
    if (initiator) {
      this.connection.request();
    } else {
      this.connection.response();
    }
  }

  update(userData: ResponseUser) {
    this.id = userData.id;
    this.name = userData.name;
    return this;
  }

  dispose() {
    if (this.connection) {
      this.connection.dispose();
      this.connection = null;
    }
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      status: this.status
    };
  }
}

/**
 * 自分のユーザー
 */
class Me {
  id: string;
  name: string;

  constructor(userData: ResponseUser) {
    this.update(userData);
  }

  update(userData: ResponseUser) {
    this.id = userData.id;
    this.name = userData.name;
    return this;
  }

  dispose() {}

  toObject() {
    return {
      id: this.id,
      name: this.name,
      status: ConnectStatus.Ok
    };
  }
}
