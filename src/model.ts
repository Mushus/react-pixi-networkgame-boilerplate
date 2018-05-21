import { observable, action } from "mobx";

export class UserModel {
  @observable name: string;
  @action
  updateFromJson(json: string) {
    let user = JSON.parse(json);
    this.name = user.name;
  }
}
