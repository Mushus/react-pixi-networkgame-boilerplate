import * as React from 'react';
import { Component } from 'react';
import { action, observable } from 'mobx';
import { inject, observer, Provider } from 'mobx-react';
import {
  RootStore,
  AppStore as IAppStore,
  SceneModel,
  STORAGE_KEY_USER
} from '@/declare';
import { UserModel } from '@/model';
import {
  Component as TitleComponent,
  SceneModel as TitleSceneModel
} from '@/scene/title';
import {
  Component as MatchingComponent,
  SceneModel as MatchingSceneModel
} from '@/scene/matching';
import {
  Component as CharaCreateComponent,
  SceneModel as CharaCreateSceneModel
} from '@/scene/characreate';

/**
 * アプリ全体のstore
 */
export class AppStore implements AppStore {
  /**
   * 現在のシーンを管理する
   */
  @observable.ref scene: SceneModel;
  @observable user: UserModel = new UserModel();
  /**
   * 招待されたパーティid
   */
  @observable invite: string;
  constructor() {
    this.transitionTitleScene();
  }
  /**
   * シーンを変更する
   */
  @action
  transitionTitleScene(store: TitleSceneModel = new TitleSceneModel()) {
    if (this.scene) this.scene.dispose();
    this.scene = store;
  }

  @action
  transitionMatchingScene(store = new MatchingSceneModel(this.user.name)) {
    if (this.scene) this.scene.dispose();
    this.scene = store;
  }

  @action
  transitionCharaCreate(store = new CharaCreateSceneModel()) {
    if (this.scene) this.scene.dispose();
    this.scene = store;
  }

  /**
   * ユーザー情報を更新する
   * @param um ユーザー
   */
  @action
  updateUser(um: UserModel) {
    this.user = um;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(um));
  }
}

const app = ({ app }: any) => {
  const props = app as AppStore;
  return (
    <div>
      {props.scene instanceof TitleSceneModel && <TitleComponent />}
      {props.scene instanceof MatchingSceneModel && <MatchingComponent />}
      {props.scene instanceof CharaCreateSceneModel && <CharaCreateComponent />}
    </div>
  );
};

export default inject('app')(observer(app));
