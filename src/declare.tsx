import * as React from "react";
import {
  SceneModel as TitleSceneModel,
  Component as TitleComponent
} from "@/scene/title";
import {
  SceneModel as MatchingSceneModel,
  Component as MatchingComponent
} from "@/scene/matching";

/**
 * シーンが持ってるstore
 */
export interface AppStore {
  scene: any;
  changeTitleScene(): void;
  changeTitleScene(store: TitleSceneModel): void;
  changeMatchingScene(): void;
  changeMatchingScene(store: MatchingSceneModel): void;
}

export interface RootStore {
  store: AppStore;
}

export interface SceneModel {
  destroy(): void;
}
