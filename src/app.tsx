import * as React from "react";
import { Component } from "react";
import { action, observable } from "mobx";
import { inject, observer, Provider } from "mobx-react";
import { RootStore, AppStore as IAppStore, SceneModel } from "@/declare";
import { UserModel } from "@/model";
import {
  Component as TitleComponent,
  SceneModel as TitleSceneModel
} from "@/scene/title";
import {
  Component as MatchingComponent,
  SceneModel as MatchingSceneModel
} from "@/scene/matching";

/**
 * アプリ全体のstore
 */
export class AppStore implements AppStore {
  /**
   * 現在のシーンを管理する
   */
  @observable.ref scene: SceneModel;
  @observable user: UserModel;
  constructor() {
    this.changeTitleScene();
  }
  /**
   * シーンを変更する
   */
  @action
  changeTitleScene(store: TitleSceneModel = new TitleSceneModel()) {
    if (this.scene) this.scene.destroy();
    this.scene = store;
  }

  @action
  changeMatchingScene(store = new MatchingSceneModel()) {
    if (this.scene) this.scene.destroy();
    this.scene = store;
  }
}

const app = ({ app }: any) => {
  const props = app as AppStore;
  return (
    <div>
      {props.scene instanceof TitleSceneModel && <TitleComponent />}
      {props.scene instanceof MatchingSceneModel && <MatchingComponent />}
    </div>
  );
};

export default inject("app")(observer(app));
