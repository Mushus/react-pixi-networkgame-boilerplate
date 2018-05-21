import { observable, action } from 'mobx';
import { UserModel } from '@/model';

export default class SceneModel {
  @observable user: UserModel;

  constructor(user = new UserModel()) {
    this.user = user;
  }

  @action
  changeUserName(name: string) {
    this.user.name = name;
  }

  @action
  destroy() {}
}
