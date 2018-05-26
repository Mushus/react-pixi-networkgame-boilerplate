import * as React from 'react';
import {
  SceneModel as TitleSceneModel,
  Component as TitleComponent
} from '@/scene/title';
import {
  SceneModel as MatchingSceneModel,
  Component as MatchingComponent
} from '@/scene/matching';
import {
  SceneModel as CharaCreateSceneModel,
  Component as CharaCreateComponent
} from '@/scene/characreate';
import { UserModel } from '@/model';

/**
 * シーンが持ってるstore
 */
export interface AppStore {
  scene: any;
  user: UserModel;
  invite: string;
  transitionTitleScene(): void;
  transitionTitleScene(store: TitleSceneModel): void;
  transitionMatchingScene(): void;
  transitionMatchingScene(store: MatchingSceneModel): void;
  transitionCharaCreate(): void;
  transitionCharaCreate(store: CharaCreateSceneModel): void;
  updateUser(um: UserModel): void;
}

export interface RootStore {
  store: AppStore;
}

export interface SceneModel {
  dispose(): void;
}

export const STORAGE_KEY_USER = 'user';
export const SEARCH_PARAM_INVITE = 'invite';
