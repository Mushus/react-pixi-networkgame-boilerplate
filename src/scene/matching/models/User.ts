import { Party } from './Party';
import PlayerConnection from '@/network/player';
import ServerConnection, {
  ResponseParty,
  ConnectionEvent,
  ResponseUser
} from '@/network/server';
import { observable, action, runInAction, computed } from 'mobx';
import { UserData } from '@/scene/matching/types';

export enum NetworkStatus {
  Me = 'me',
  Connecting = 'connecting',
  Connected = 'connected'
}

export class User {
  connection: PlayerConnection;
  @observable id: string;
  @observable name: string;
  @observable isMe: boolean;
  @observable _networkStatus: NetworkStatus;

  constructor(
    serverConnection: ServerConnection,
    ud: UserData,
    myUserId: string,
    isReceive: boolean
  ) {
    this.update(ud);
    this.isMe = myUserId === this.id;
    this._networkStatus = this.isMe
      ? NetworkStatus.Me
      : NetworkStatus.Connecting;
    if (!this.isMe) {
      (async () => {
        this.connection = new PlayerConnection(serverConnection, this.id);
        if (isReceive) {
          await this.requestPeer();
        } else {
          await this.responsePeer();
        }
        runInAction(() => {
          this._networkStatus = NetworkStatus.Connected;
        });
        return;
      })();
    }
  }

  @action
  update(ud: UserData): User {
    this.id = ud.id;
    this.name = ud.name;
    return this;
  }

  @action
  requestPeer() {
    if (this.connection) {
      return this.connection.request(this.id);
    }
  }

  @action
  responsePeer() {
    if (this.connection) {
      return this.connection.response();
    }
  }

  @action
  dispose() {
    if (this.connection) {
      this.connection.dispose();
    }
  }

  @computed
  get networkStatus() {
    return this._networkStatus;
  }
}
