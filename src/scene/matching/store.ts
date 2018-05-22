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

  playerConnection: Peer.Instance;

  constructor(invite: string = null) {
    this.init(invite);
    this.transitionRobby();
  }

  @action
  init(invite: string) {
    (async () => {
      const isInvite = invite != null;
      const initiator = invite == null;
      const offer = await this.createPlayerConnection(initiator);
      const conn = await this.createServerConnection();
      if (isInvite) {
        await this.joinParty(invite);
      } else {
        // 初期状態でパーティを作成
        await this.createParty(offer);
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
      runInAction(() => {
        this.playerConnection = peer;
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
  createServerConnection() {
    return new Promise(resolve => {
      const conn = new ServerConnection(
        `ws://${config.matchingServer.url}/matching`
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
    });
  }

  @action
  async createParty(offer: any) {
    const conn = this.serverConnection;
    const party = (await conn.createParty(offer)) as ResponseParty;
    runInAction(() => {
      this.party = new PartyModel(party);
    });
  }

  @action
  async joinParty(partyId: string) {
    const party = await this.getParty(partyId);
    const offer = JSON.parse(party.ownerOffer);
    this.playerConnection.signal(offer);
    return party;
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
    this.playerConnection.destroy();
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
  @observable ownerOffer: string;
  @observable isPrivate: boolean;
  @observable maxUsers: number;
  @observable userCount: number;
  @observable users: UserModel[];

  constructor({
    id,
    isPrivate,
    maxUsers,
    userCount,
    ownerOffer
  }: {
    id: string;
    isPrivate: boolean;
    maxUsers: number;
    userCount: number;
    ownerOffer: string;
  }) {
    this.id = id;
    this.isPrivate = isPrivate;
    this.maxUsers = maxUsers;
    this.userCount = userCount;
    this.ownerOffer = ownerOffer;
  }
}

export class UserModel {
  @observable id: string;
  @observable name: string;
}
