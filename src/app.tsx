import * as React from 'react'
import { Component } from 'react'
import { action, observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Scene, SceneStore, SceneComponents } from '@/declare'

export type AppStoreType = {
  scene: Scene
  changeScene: (scene: Scene) => void
}

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
  changeScene = (scene: Scene): void => {
    this.scene = scene
  }
}

const app = ({ store }: { store: AppStoreType}) => (
  <div>
    { React.createElement(SceneComponents[store.scene], store) }
  </div>
)

export default observer(app)