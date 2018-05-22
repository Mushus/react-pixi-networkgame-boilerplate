import axios from 'axios';
import { observable, action, runInAction } from 'mobx';
import config from '@/config';
import ServerConnection, { ResponseParty } from '@/serverConnection';

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

  constructor(invite: string = null) {
    this.init(invite);
    this.transitionRobby();
  }

  @action
  init(invite: string) {
    const conn = new ServerConnection(
      `ws://${config.matchingServer.url}/matching`
    );
    conn.onopen = message => {
      if (invite == null) {
        // 初期状態でパーティを作成
        this.createParty();
      } else {
        this.joinParty(invite);
      }
    };
    conn.onclose = action(message => {
      this.networkClosed = true;
    });

    this.serverConnection = conn;
  }

  @action
  async createParty() {
    const conn = this.serverConnection;
    const party = (await conn.createParty()) as ResponseParty;
    runInAction(() => {
      this.party = new PartyModel(party);
    });
  }

  @action
  async joinParty(partyId: string) {
    const conn = this.serverConnection;
    const party = await conn.getParty(partyId);
    runInAction(() => {
      this.party = new PartyModel(party);
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
  @observable userCount: number;
  @observable users: UserModel[];

  constructor({
    id,
    isPrivate,
    maxUsers,
    userCount
  }: {
    id: string;
    isPrivate: boolean;
    maxUsers: number;
    userCount: number;
  }) {
    this.id = id;
    this.isPrivate = isPrivate;
    this.maxUsers = maxUsers;
    this.userCount = userCount;
  }
}

export class UserModel {
  @observable id: string;
  @observable name: string;
}
