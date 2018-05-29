import { observable, action, runInAction } from 'mobx';
import ServerConnection, {
  ResponseParty,
  ConnectionEvent,
  ResponseUser
} from '@/network/server';
import { UserData, PartyData } from '@/scene/matching/types';
import { User } from './User';

export class Party {
  @observable id: string;
  @observable owner: User;
  @observable isPrivate: boolean;
  @observable maxUsers: number;
  @observable.shallow users: User[] = [];

  myUserId: string;

  serverConnection: ServerConnection;

  constructor(
    serverConnection: ServerConnection,
    pd: PartyData,
    userId: string
  ) {
    this.serverConnection = serverConnection;
    this.myUserId = userId;
    this.update(pd, true);
  }

  // NOTE: myUserId, serverConnectionを設定している必要がある
  @action
  update(pd: PartyData, isInit = false): Party {
    this.id = pd.id;
    this.isPrivate = pd.isPrivate;
    this.maxUsers = pd.maxUsers;

    // ユーザーの情報のインスタンスを生成し直さないように更新する
    const newUsers: User[] = [];
    for (const userData of pd.users) {
      const index = this.users.findIndex(user => user.id === userData.id);
      const isFound = index !== -1;
      newUsers[newUsers.length] = isFound
        ? this.users[index].update(userData)
        : new User(this.serverConnection, userData, this.myUserId, isInit);
      delete this.users[index];
    }
    for (const user of this.users) {
      user.dispose();
    }
    this.users = newUsers;
    this.owner = newUsers.find(user => user.id === pd.owner.id);

    return this;
  }

  @action
  dispose() {
    for (const user of this.users) {
      user.dispose();
    }
  }
}
