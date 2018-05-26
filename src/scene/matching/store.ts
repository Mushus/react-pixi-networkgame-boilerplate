import axios from 'axios';
import { observable, action, runInAction } from 'mobx';
import config from '@/config';
import ServerConnection, { ResponseParty } from '@/serverConnection';
import * as Peer from 'simple-peer';

const msUrl = `${config.matchingServer.scheme}://${config.matchingServer.url}`;

export default class SceneModel {
  // シーン
  @observable.ref scene: any;
  // ネットワークが閉じられているかどうか
  @observable networkClosed = false;
  //パーティ
  @observable.ref party: PartyModel;
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
   * P2Pコネクションを用意する
   */
  @action
  createPlayerConnection(initiator: boolean) {
    return new Promise<{}>(resolve => {
      const peer = new Peer({ initiator: initiator });
      peer.on('error', data => {
        console.log('error', data);
      });
      peer.on('signal', data => {
        console.log('signal', data);
        if (data.type == 'offer') {
          resolve(data);
        }
        if (data.type == 'answer') {
          peer.signal(data);
        }
      });
      peer.on('connect', data => {
        console.log('connect', data);
      });
      peer.on('data', data => {
        console.log('data', data);
      });
      if (!initiator) {
        resolve();
      }
    });
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
      conn.onopen = message => {
        resolve(conn);
      };
      conn.onclose = action(message => {
        this.networkClosed = true;
      });

      runInAction(() => {
        this.serverConnection = conn;
      });
      conn.onModifyParty = party => {
        runInAction(() => {
          this.party = party;
        });
      };
    });
  }

  @action
  async createParty() {
    const party = (await this.serverConnection.createParty()) as ResponseParty;
    runInAction(() => {
      this.party = new PartyModel(party);
    });
  }

  @action
  async joinParty(partyId: string) {
    const party = (await this.serverConnection.joinParty(
      partyId
    )) as ResponseParty;
    runInAction(() => {
      this.party = new PartyModel(party);
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
  destroy() {
    console.log('destroy matching');
    this.serverConnection.close();
    //his.playerConnection.destroy();
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
  @observable.shallow users: UserModel[];

  constructor(pd: PartyData) {
    this.update(pd);
  }

  @action
  update(pd: PartyData): PartyModel {
    this.id = pd.id;
    this.isPrivate = pd.isPrivate;
    this.maxUsers = pd.maxUsers;

    // ユーザーの情報のインスタンスを生成し直さないように更新する
    const newUsers: UserModel[] = [];
    for (const userData of pd.users) {
      const index = this.users.findIndex(user => user.id === userData.id);
      const isFound = index === -1;
      newUsers[newUsers.length] = isFound
        ? this.users[index].update(userData)
        : new UserModel(userData);
      delete this.users[index];
    }
    for (const user of this.users) {
      user.destroy();
    }
    this.users = newUsers;
    this.owner = newUsers.find(user => user.id === pd.owner.id);

    return this
  }
}

export interface UserData {
  name: string;
  id: string;
}

export class UserModel {
  @observable id: string;
  @observable name: string;

  constructor(ud: UserData) {
    this.update(ud)
  }

  @action
  update(ud: UserData): UserModel {
    this.id = ud.id;
    this.name = ud.name;
    return this
  }

  @action
  destroy() {}
}
