import * as React from "react";
import {
  Store as TitleStore,
  Component as TitleComponent
} from "@/scene/title";
import {
  Store as MatchingStore,
  Component as MatchingComponent
} from "@/scene/matching";

/**
 * シーンが持ってるstore
 */
export interface AppStore {
  scene: any
  changeTitleScene(): void;
  changeTitleScene(store: TitleStore): void;
  changeMatchingScene(): void;
  changeMatchingScene(store: MatchingStore): void;
}

export interface RootStore {
  store: AppStore
}

export interface SceneModel {
  destroy(): void
}