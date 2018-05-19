import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Scene, SceneStore } from '@/declare'
import Store from './store'

const title = ({ store }: any) => {
  const props = store as SceneStore
  return <div>
    <h2>title</h2>
    <button onClick={ () => props.changeMatchingScene(Scene.MATCHING) }> start </button>
  </div>
}

export default inject(store => store)(observer(title))