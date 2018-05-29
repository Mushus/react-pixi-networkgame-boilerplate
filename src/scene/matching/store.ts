import { observable, action, runInAction } from 'mobx';
import config from '@/config';
import ServerConnection, {
  ResponseParty,
  ConnectionEvent,
  ResponseUser
} from '@/network/server';
import { UserData, PartyData } from '@/scene/matching/types';
import { Party } from './models/Party';

const msUrl = `${config.matchingServer.scheme}://${config.matchingServer.url}`;

export default class SceneModel {
  // シーン
  @observable.ref scene: any;
  // ネットワークが閉じられているかどうか
  @observable networkClosed = false;
  //パーティ
  @observable.ref party: Party;
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
      conn.on('open', () => {
        resolve(conn);
      });
      conn.on('close', () =>
        action(message => {
          this.networkClosed = true;
        })
      );

      runInAction(() => {
        this.serverConnection = conn;
      });

      conn.on(
        ConnectionEvent.ModifyParty,
        action(party => {
          this.party.update(party as ResponseParty);
        })
      );

      conn.on(
        ConnectionEvent.CreateUser,
        action(user => {
          this.me = user as ResponseUser;
        })
      );
    });
  }

  @action
  async createParty() {
    const party = (await this.serverConnection.createParty()) as PartyData;
    runInAction(() => {
      this.party = new Party(this.serverConnection, party, this.me.id);
    });
  }

  @action
  async joinParty(partyId: string) {
    const party = (await this.serverConnection.joinParty(partyId)) as PartyData;
    runInAction(() => {
      this.party = new Party(this.serverConnection, party, this.me.id);
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
