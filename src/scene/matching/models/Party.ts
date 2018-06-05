import { observable, action, runInAction } from 'mobx';
import ServerConnection, {
  ResponseParty,
  ConnectionEvent,
  ResponseUser
} from '@/network/server';
import { UserData, PartyData } from '@/scene/matching/types';
import { unstable_batchedUpdates } from 'react-dom';

export class Party {
  @observable id: string;
  @observable.ref owner: UserData;
  @observable isPrivate: boolean;
  @observable maxUsers: number;
  @observable.ref users: UserData[];

  constructor() {}

  get inviteUrl() {
    return `${location.href}?invite=${this.id}`;
  }

  // NOTE: myUserId, serverConnectionを設定している必要がある
  update(partyData: any) {
    this.id = partyData.id;
    this.owner = partyData.owner;
    this.isPrivate = partyData.isPrivate;
    this.maxUsers = partyData.maxUsers;
    this.users = partyData.users;
  }
}
