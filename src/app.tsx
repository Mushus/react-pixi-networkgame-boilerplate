import * as React from "react";
import { Component } from "react";
import { action, observable } from "mobx";
import { inject, observer, Provider } from "mobx-react";
import { Scene, SceneStore } from "@/declare";
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
} & SceneStore;

/**
 * アプリ全体のstore
 */
export class AppStore implements SceneStore {
  /**
   * 現在のシーンを管理する
   */
  @observable scene: Scene = Scene.TITLE;

  @observable matching: MatchingStore = null;
  @observable title: TitleStore = null;
  /**
   * シーンを変更する
   */
  changeTitleScene(store: TitleStore): TitleStore {
    this.scene = Scene.TITLE;
    return {};
  }

  changeMatchingScene(store: MatchingStore): MatchingStore {
    this.scene = Scene.MATCHING;
    const matchingStore =  store || new MatchingStore();
    const oldStore = this.matching
    this.matching = matchingStore
    return oldStore
  }
}

const app = ({ store }: any) => {
  const props: AppStore = store;
  return (
    <div>
      {props.scene === Scene.TITLE && <TitleComponent />}
      {props.scene === Scene.MATCHING && <MatchingComponent />}
    </div>
  );
};

export default inject(store => store)(observer(app));
