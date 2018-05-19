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
 * シーン
 */
export enum Scene {
  TITLE = "title",
  MATCHING = "matching"
}

/**
 * シーンが持ってるstore
 */
export interface SceneStore {
  changeTitleScene(store: TitleStore): TitleStore;
  changeMatchingScene(store: MatchingStore): MatchingStore;
}
