import * as React from 'react'
import Title from '@/scene/title'
import Matching from '@/scene/matching'

/**
 * シーン
 */
export enum Scene {
  TITLE = 'title',
  MATCHING = 'matching'
}

/**
 * シーン一覧
 */
export const SceneComponents = {
  [Scene.TITLE]: Title,
  [Scene.MATCHING]: Matching
}

/**
 * シーンが持ってるstore
 */
export interface SceneStore {
  changeScene(scene: Scene): void
}