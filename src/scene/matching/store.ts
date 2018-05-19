import axios from 'axios'
import { observable, action } from "mobx";
import config from '@/config'
import { NOTINITIALIZED } from 'dns';
import { createCipher } from 'crypto';

export enum Scene {
  ROOM_SELECT = 'room_select',
  CREATE_ROOM = 'create_room',
  ROOM = 'room'
}

export default class Store {
  @observable scene: Scene = Scene.ROOM_SELECT

  @observable rooms: Room[] = [];

  room: Room = null;

  @observable createRoom: CreateRoomModel = null

  constructor() {
    this.init()
  }

  @action async init() {
    try {
      const res = await axios.get<{rooms: Room[]}>(`${config.matchingServerUrl}`)
      this.rooms = res.data.rooms
    } catch(e) {
      console.log("error")
    }
  }

  roomSelect() {
    this.scene = Scene.ROOM_SELECT
  }

  createRoomForm() {
    this.scene = Scene.CREATE_ROOM
    this.createRoom = new CreateRoomModel()
  }

  @action async cresponseCreateRoom() {
    try {
      const res = await axios.post(`${config.matchingServerUrl}/room`, {
        name: this.createRoom.name,
        password: this.createRoom.password,
        isAutoMatching: this.createRoom.isAutoMatching,
        maxUser: 8
      })
      console.log(res);
    } catch(e) {
      console.log("error")
    }
  }

  joinRoom(roomId: string) {
    this.scene = Scene.ROOM
  }
}

class CreateRoomModel {
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
