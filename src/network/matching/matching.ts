import ServerConnection, { ConnectionEvent, ResponseUser } from "@/network/server";
import { isComputingDerivation } from "mobx";
import PlayerConnection from "@/network/player";

export class Matching {
  _serverConnection: ServerConnection
  _me: User
  _party: Party
  constructor(wsUrl: string, userName: string) {
    const conn = new ServerConnection(wsUrl, userName)
    this._serverConnection = conn

    conn.on(ConnectionEvent.CreateUser, (user: ResponseUser) => {
      this._me = new User(user.id, user.name, this)
    })
  }

  async createParty(isPrivate: boolean, maxUsers: number) {
    const party = await this._serverConnection.createParty(isPrivate, maxUsers)
    this._party = new Party(party.id, party.isPrivate, party.maxUsers, party.owner, party.users, this._me, this);
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

class Party {
  id: string
  owner: User
  isPrivate: boolean
  maxUsers: number
  users: User[]

  constructor(id: string, isPrivate: boolean, maxUsers: number, owner: ResponseUser, users: ResponseUser[], me: User, system: Matching) {
    this.id = id
    this.isPrivate = isPrivate
    this.maxUsers = maxUsers
    this.owner = me.id == owner.id? me : new User(owner.id, owner.name, system)
    
  }

  dispose() {
    for (const user of this.users) {
      user.dispose()
    }
  }
}

class User {
  id: string
  name: string
  connection: PlayerConnection

  constructor(id: string, name: string, system: Matching) {
    this.id = id;
    this.name = name;
  }

  dispose() {
    if (this.connection) {
      this.connection.dispose()
      this.connection = null
    }
  }
}