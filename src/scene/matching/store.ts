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
    return new Promise(resolve => {
      const conn = new ServerConnection(
        `ws://${config.matchingServer.url}`,
        userName,
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
      conn.onModifyParty = (party) => {
        runInAction(() => {
          this.party = party
        });
      }
    });
  }

  @action
  async createParty() {
    const party = await this.serverConnection.createParty() as ResponseParty;
    runInAction(() => {
      this.party = new PartyModel(party);
    });
  }

  @action
  async joinParty(partyId: string) {
    const party = await this.serverConnection.joinParty(partyId)  as ResponseParty;
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

export class RobbyModel {
  @observable isOpenInviteDialog = false;

  @action
  setIsOpenInviteDialog(opened: boolean) {
    this.isOpenInviteDialog = opened;
  }
}

export class PublicMatchModel {}

export class PrivateMatchModel {}

export class PartyModel {
  @observable id: string;
  @observable owner: UserModel
  @observable isPrivate: boolean;
  @observable maxUsers: number;
  @observable.ref users: UserModel[];

  constructor({
    id,
    owner,
    isPrivate,
    users,
    maxUsers,
  }: {
    id: string;
    owner: UserModel;
    isPrivate: boolean;
    users: UserModel[];
    maxUsers: number;
  }) {
    this.id = id;
    this.owner = new UserModel(owner);
    this.isPrivate = isPrivate;
    this.maxUsers = maxUsers;
    this.users = users.map(user => new UserModel(user));
  }
}

export class UserModel {
  @observable id: string;
  @observable name: string;

  constructor({ name }: { name:string }) {
    this.name = name
  }
}
