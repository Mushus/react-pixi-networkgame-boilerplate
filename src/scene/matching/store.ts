import { observable, action, runInAction } from 'mobx';
import config from '@/config';
import ServerConnection, {
  ResponseParty,
  ConnectionEvent,
  ResponseUser
} from '@/network/server';
import { UserData, PartyData } from '@/scene/matching/types';
import { Party } from './models/Party';
import { Matching, MatchingEvent } from '@/network/matching/matching';

const msUrl = `${config.matchingServer.scheme}://${config.matchingServer.url}`;

export default class SceneModel {
  // シーン
  @observable.ref scene: any;
  // ネットワークが閉じられているかどうか
  @observable networkClosed = false;
  //パーティ
  @observable party: Party;
  @observable.ref me: UserData;
  // websocket
  matching: Matching = null;

  constructor(userName: string, invite: string = null) {
    this.init(invite, userName);
    this.transitionRobby();
  }

  @action
  init(invite: string, userName: string) {
    const isInvite = invite != null;
    this.matching = new Matching(msUrl, userName);
    this.matching.once(MatchingEvent.ConnectServer, () => {
      if (isInvite) {
        this.matching.joinParty(invite);
      } else {
        // 初期状態でパーティを作成
        this.matching.createParty(false, 0);
      }
    });
    this.matching.on(
      MatchingEvent.Update,
      action((party: PartyData) => {
        this.party = this.party || new Party();
        this.party.update(party);
      })
    );
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
    this.matching.dispose();
    //his.playerConnection.dispose();
  }
}

export class RobbyModel {}

export class PublicMatchModel {}

export class PrivateMatchModel {}
