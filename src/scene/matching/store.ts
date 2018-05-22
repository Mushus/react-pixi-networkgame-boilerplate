import axios from 'axios';
import { observable, action, runInAction } from 'mobx';
import config from '@/config';
import ServerConnection, { ResponseCreateRoom } from '@/serverConnection';

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

  constructor() {
    this.init();
    this.transitionRobby();
  }

  @action
  init() {
    const conn = new ServerConnection(
      `ws://${config.matchingServer.url}/matching`
    );
    conn.onopen = message => {
      // 初期状態でパーティを作成
      this.createParty();
    };
    conn.onclose = action(message => {
      this.networkClosed = true;
    });

    this.serverConnection = conn;
  }
  @action
  async createParty() {
    const conn = this.serverConnection;
    const party = (await conn.createParty()) as ResponseCreateRoom;
    console.log(party);
    const pm = new PartyModel();
    pm.id = party.id;
    pm.isPrivate = party.isPrivate;
    pm.maxUsers = party.maxUsers;
    runInAction(() => {
      this.party = pm;
    });
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
  @observable isPrivate: boolean;
  @observable maxUsers: number;
  @observable users: UserModel[];
}

export class UserModel {
  @observable id: string;
  @observable name: string;
}
