import * as React from "react";
import { Component } from "react";
import { action, observable } from "mobx";
import { inject, observer, Provider } from "mobx-react";
import { Scene, RootStore, AppStore as IAppStore } from "@/declare";
import {
  Component as TitleComponent,
  Store as TitleStore
} from "@/scene/title";
import {
  Component as MatchingComponent,
  Store as MatchingStore
} from "@/scene/matching";

export type AppStoreType = {
  scene: Scene;
} & AppStore;

/**
 * アプリ全体のstore
 */
export class AppStore implements AppStore {
  /**
   * 現在のシーンを管理する
   */
  @observable.ref scene: any

  constructor () {
    this.changeTitleScene()
  }
  /**
   * シーンを変更する
   */
  @action changeTitleScene(store: TitleStore = new TitleStore()) {
    this.scene = store
  }

  @action changeMatchingScene(store = new MatchingStore()) {
    console.log(this)
    this.scene = store
  }
}

const app = ({ app }: any) => {
  const props = app as AppStore;
  return (
    <div>
      {props.scene instanceof TitleStore && <TitleComponent />}
      {props.scene instanceof MatchingStore && <MatchingComponent />}
    </div>
  );
};

export default inject("app")(observer(app));
