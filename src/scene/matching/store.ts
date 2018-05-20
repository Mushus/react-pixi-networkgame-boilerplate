import axios from 'axios'
import { observable, action } from "mobx";
import config from '@/config'
import { NOTINITIALIZED } from 'dns';
import { createCipher } from 'crypto';

const msUrl = `${config.matchingServer.scheme}://${config.matchingServer.url}`

export default class SceneModel {
  @observable.ref scene: any

  @observable rooms: Room[] = [];

  @observable socket: WebSocket = null;

  constructor() {
    this.init()
    this.roomSelect()
  }

  @action async init() {
    const socket = new WebSocket(`ws://${config.matchingServer.url}/matching`)
    socket.onmessage = (message) => {
      console.log(message)
    }
    socket.onclose = (message) => {
      console.log(message)
    }
    this.socket = socket
  }

  @action roomSelect() {
    this.scene = new RobbyModel()
  }

  @action createRoomForm() {
    this.scene = new CreateRoomModel()
  }
}

export class RobbyModel {

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
