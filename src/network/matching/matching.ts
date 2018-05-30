import ServerConnection, { ConnectionEvent, ResponseUser, ResponseParty } from "@/network/server";
import PlayerConnection from "@/network/player";

export class Matching {
  _serverConnection: ServerConnection
  _me: User
  _party: Party
  constructor(wsUrl: string, userName: string) {
    const conn = new ServerConnection(wsUrl, userName)
    this._serverConnection = conn

    conn.on(ConnectionEvent.CreateUser, (user: ResponseUser) => {
      this._me = new Me(user)
    })
  }

  async createParty(isPrivate: boolean, maxUsers: number) {
    const partyData = await this._serverConnection.createParty(isPrivate, maxUsers)
    this._party = new Party(partyData, this._me, this);
  }

  _createPlayerConnection(userId: string, initiator: boolean) {
    const pc = new PlayerConnection(this._serverConnection, userId);
    pc.createPeer(initiator)
    return pc
  }

  get me() {
    return this._me
  }

  dispose() {
    this._serverConnection.dispose()
    this._party.dispose()
    this._me.dispose()
  }
}

class Room {
  id: string
  users: number[]

}

/**
 * パーティ情報
 */
class Party {
  id: string
  owner: User
  isPrivate: boolean
  maxUsers: number
  users: User[]

  constructor(partyData: ResponseParty, me: User, system: Matching) {
    this.users[0] = me;
    this.update(partyData, system, true)
  }

  update(partyData: ResponseParty, system: Matching, initiator = false): Party {
    this.id = partyData.id;
    this.isPrivate = partyData.isPrivate;
    this.maxUsers = partyData.maxUsers;

    // ユーザーの情報のインスタンスを生成し直さないように更新する
    const newUsers: User[] = [];
    for (const userData of partyData.users) {
      const index = this.users.findIndex(user => user.id === userData.id);
      const isFound = index !== -1;
      newUsers[newUsers.length] = isFound
        ? this.users[index].update(userData)
        : new remoteUser(userData, system, initiator);
      delete this.users[index];
    }
    for (const user of this.users) {
      user.dispose();
    }
    this.users = newUsers;
    this.owner = newUsers.find(user => user.id === partyData.owner.id);

    return this;
  }

  dispose() {
    for (const user of this.users) {
      user.dispose()
    }
  }
}

/**
 * ユーザー情報
 */
interface User {
  id: string
  update(userData: ResponseUser): User
  dispose(): void
}

/**
 * リモートユーザー
 */
class remoteUser {
  id: string
  name: string
  connection: PlayerConnection

  constructor(userData: ResponseUser, system: Matching, initiator: boolean) {
    this.update(userData);
    this.connection = system._createPlayerConnection(this.id, initiator);
  }

  update(userData: ResponseUser) {
    this.id = userData.id;
    this.name = userData.name;
    return this
  }

  dispose() {
    if (this.connection) {
      this.connection.dispose()
      this.connection = null
    }
  }
}

/**
 * 自分のユーザー
 */
class Me {
  id: string
  name: string

  constructor(userData: ResponseUser) {
    this.update(userData);
  }

  update(userData: ResponseUser) {
    this.id = userData.id;
    this.name = userData.name;
    return this
  }

  dispose() {
  }
}