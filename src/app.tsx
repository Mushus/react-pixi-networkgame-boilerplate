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

  /**
   * シーンを変更する
   */
  changeTitleScene(store: TitleStore): TitleStore {
    this.scene = Scene.TITLE;
    return {};
  }

  changeMatchingScene(store: MatchingStore): MatchingStore {
    this.scene = Scene.MATCHING;
    return {};
  }
}

const app = ({ store }: any) => {
  const { scene }: AppStore = store;
  return (
    <div>
      {scene === Scene.TITLE && <TitleComponent />}
      {scene === Scene.MATCHING && <MatchingComponent />}
    </div>
  );
};

export default inject(store => store)(observer(app));
