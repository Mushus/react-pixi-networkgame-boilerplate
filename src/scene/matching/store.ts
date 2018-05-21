import axios from "axios";
import { observable, action } from "mobx";
import config from "@/config";

const msUrl = `${config.matchingServer.scheme}://${config.matchingServer.url}`;

export default class SceneModel {
  // シーン
  @observable.ref scene: any;
  // ネットワークが閉じられているかどうか
  @observable networkClosed = false;
  //パーティ
  @observable party: PartyModel;
  // websocket
  socket: WebSocket = null;

  constructor() {
    this.init();
    this.transitionRobby();
  }

  @action
  async init() {
    const socket = new WebSocket(`ws://${config.matchingServer.url}/matching`);
    socket.onmessage = message => {
      console.log(message);
    };
    socket.onclose = action(message => {
      this.networkClosed = true;
    });
    this.socket = socket;
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
    console.log("destroy matching");
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
  @observable users: UserModel[];
}

export class UserModel {
  @observable id: string;
  @observable name: string;
}
