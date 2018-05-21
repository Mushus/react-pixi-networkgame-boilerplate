import axios from 'axios';
import { observable, action } from 'mobx';
import config from '@/config';

const msUrl = `${config.matchingServer.scheme}://${config.matchingServer.url}`;

export default class SceneModel {
  // シーン
  @observable.ref scene: any;
  // ネットワークが閉じられているかどうか
  @observable networkClosed = false;
  //パーティ
  @observable.ref party: PartyModel;
  // websocket
  socket: WebSocket = null;

  constructor() {
    this.init();
    this.transitionRobby();
  }

  @action
  init() {
    const socket = new WebSocket(`ws://${config.matchingServer.url}/matching`);
    socket.onmessage = message => {
      const json = JSON.parse(message.data);
      if (json.status == 'ng') {
        console.log(json);
        return;
      }
      switch (json.action) {
        case 'create_party':
          this.responseCreateParty(json.param);
          break;
      }
      console.log(message.data);
    };
    socket.onclose = action(message => {
      this.networkClosed = true;
    });
    socket.onopen = action(message => {
      this.requestCreateParty();
    });
    this.socket = socket;
  }

  requestCreateParty() {
    if (!this.socket || this.socket.readyState != WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({
        action: 'create_party',
        param: {
          isPrivate: true,
          maxUsers: 0
        }
      })
    );
  }

  @action
  responseCreateParty(param: any) {
    const pm = new PartyModel();
    pm.id = param.id;
    pm.isPrivate = param.isPrivate;
    pm.maxUsers = param.maxUsers;
    this.party = pm;
    console.log(pm);
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
    this.socket.close();
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
