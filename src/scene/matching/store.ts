import axios from 'axios';
import { observable, action, runInAction } from 'mobx';
import config from '@/config';
import ServerConnection, { ResponseParty, ConnectionEvent, ResponseUser } from '@/network/server';
import PlayerConnection from '@/network/player';
import { runInThisContext } from 'vm';

const msUrl = `${config.matchingServer.scheme}://${config.matchingServer.url}`;

export default class SceneModel {
  // シーン
  @observable.ref scene: any;
  // ネットワークが閉じられているかどうか
  @observable networkClosed = false;
  //パーティ
  @observable.ref party: PartyModel;
  @observable.ref me: UserData;
  // websocket
  serverConnection: ServerConnection = null;

  constructor(userName: string, invite: string = null) {
    this.init(invite, userName);
    this.transitionRobby();
  }

  @action
  init(invite: string, userName: string) {
    (async () => {
      const isInvite = invite != null;
      const conn = await this.createServerConnection(userName);
      runInAction(() => {
        this.serverConnection = conn;
      });
      if (isInvite) {
        await this.joinParty(invite);
      } else {
        // 初期状態でパーティを作成
        await this.createParty();
      }
    })();
  }

  /**
   * サーバーとのコネクションを用意する
   */
  @action
  createServerConnection(userName: string) {
    return new Promise<ServerConnection>(resolve => {
      const conn = new ServerConnection(
        `ws://${config.matchingServer.url}`,
        userName
      );
      conn.on("open", () => {
        resolve(conn)
      });
      conn.on("close", () => action(message => {
        this.networkClosed = true;
      }));

      runInAction(() => {
        this.serverConnection = conn;
      });

      conn.on(ConnectionEvent.ModifyParty, action(party => {
        this.party.update(party as ResponseParty);
      }));

      conn.on(ConnectionEvent.CreateUser, action(user => {
        this.me = user as ResponseUser;
      }))
    });
  }

  @action
  async createParty() {
    const party = (await this.serverConnection.createParty()) as PartyData;
    runInAction(() => {
      this.party = new PartyModel(this.serverConnection, party, this.me.id);
    });
  }

  @action
  async joinParty(partyId: string) {
    const party = (await this.serverConnection.joinParty(partyId)) as PartyData;
    runInAction(() => {
      this.party = new PartyModel(this.serverConnection, party, this.me.id);
    });
  }

  @action
  async getParty(partyId: string) {
    const party = await this.serverConnection.getParty(partyId);
    return party;
  }

  @action
  transitionPublicMatch(pmm = new PublicMatchModel()) {
    this.scene = pmm;
  }

  @action
  transitionPrivateMatch(pmm = new PrivateMatchModel()) {
    this.scene = pmm;
  }

  @action
  transitionRobby() {
    this.scene = new RobbyModel();
  }

  @action
  dispose() {
    console.log('dispose matching');
    this.serverConnection.dispose();
    //his.playerConnection.dispose();
  }
}

export class RobbyModel {}

export class PublicMatchModel {}

export class PrivateMatchModel {}

export interface PartyData {
  id: string;
  owner: UserData;
  isPrivate: boolean;
  users: UserData[];
  maxUsers: number;
}

export class PartyModel {
  @observable id: string;
  @observable owner: UserModel;
  @observable isPrivate: boolean;
  @observable maxUsers: number;
  @observable.shallow users: UserModel[] = [];

  myUserId: string;

  serverConnection: ServerConnection;

  constructor(
    serverConnection: ServerConnection,
    pd: PartyData,
    userId: string
  ) {
    this.serverConnection = serverConnection;
    this.myUserId = userId;
    this.update(pd, true);
  }

  // NOTE: myUserId, serverConnectionを設定している必要がある
  @action
  update(pd: PartyData, isInit = false): PartyModel {
    this.id = pd.id;
    this.isPrivate = pd.isPrivate;
    this.maxUsers = pd.maxUsers;

    // ユーザーの情報のインスタンスを生成し直さないように更新する
    const newUsers: UserModel[] = [];
    for (const userData of pd.users) {
      const index = this.users.findIndex(user => user.id === userData.id);
      const isFound = index !== -1;
      newUsers[newUsers.length] = isFound
        ? this.users[index].update(userData)
        : new UserModel(this.serverConnection, userData, this.myUserId, isInit);
      delete this.users[index];
    }
    for (const user of this.users) {
      user.dispose();
    }
    this.users = newUsers;
    this.owner = newUsers.find(user => user.id === pd.owner.id);

    return this;
  }

  @action
  dispose() {
    for (const user of this.users) {
      user.dispose();
    }
  }
}

export interface UserData {
  name: string;
  id: string;
}

export class UserModel {
  connection: PlayerConnection;
  @observable id: string;
  @observable name: string;
  @observable isMe: boolean;

  constructor(
    serverConnection: ServerConnection,
    ud: UserData,
    myUserId: string,
    isReceive: boolean,
  ) {
    this.update(ud);
    this.isMe = myUserId === this.id;
    if (!this.isMe) {
      (async () => {
        this.connection = new PlayerConnection(serverConnection, this.id);
        if (isReceive) {
          await this.requestPeer();
        } else {
          await this.responsePeer();
        }
        return;
      })();
    }
  }

  @action
  update(ud: UserData): UserModel {
    this.id = ud.id;
    this.name = ud.name;
    return this;
  }

  @action
  requestPeer() {
    if (this.connection) {
      return this.connection.request(this.id);
    }
  }

  @action
  responsePeer() {
    if (this.connection) {
      return this.connection.response()
    }
  }

  @action
  dispose() {
    if (this.connection) {
      this.connection.dispose();
    }
  }
}
