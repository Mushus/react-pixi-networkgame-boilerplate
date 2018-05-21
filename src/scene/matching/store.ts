import axios from 'axios'
import { observable, action } from "mobx";
import config from '@/config'

const msUrl = `${config.matchingServer.scheme}://${config.matchingServer.url}`

export default class SceneModel {
  @observable.ref scene: any
  @observable rooms: Room[] = [];
  @observable networkClosed = false;
  socket: WebSocket = null;

  constructor() {
    this.init()
    this.roomSelect()
  }

  @action async init() {
    const socket = new WebSocket(`ws://${config.matchingServer.url}/matching`)
    socket.onmessage = (message) => {
      console.log(message)
    }
    socket.onclose = action((message) => {
      this.networkClosed = true
    })
    this.socket = socket
  }

  @action roomSelect() {
    this.scene = new RobbyModel()
  }

  @action createRoomForm() {
    this.scene = new CreateRoomModel()
  }

  @action destroy() {
    console.log("destroy matching")
    this.socket.close()
  }
}

export class PartyModel {

}

export class RobbyModel {
  @observable isOpenInviteDialog = false;

  @action setIsOpenInviteDialog(opened: boolean) {
    this.isOpenInviteDialog = opened
  }
}

export class CreateRoomModel {
  @observable name: string = ""
  @observable password: string = ""
  @observable isAutoMatching: boolean = false
}

interface Room {
  id: string;
  name: string;
  maxUsers: number;
  hasPassword: boolean;
}
