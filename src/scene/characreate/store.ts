import { observable, action } from "mobx";

export default class SceneModel {
  @observable user = new UserModel();

  @action
  changeUserName(name: string) {
    this.user.name = name;
  }

  @action
  destroy() {}
}

class UserModel {
  @observable name: string = "";
}
