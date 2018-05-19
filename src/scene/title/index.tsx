import * as React from 'react'
import { Component } from 'react'
import { Scene, SceneStore } from '@/declare'

const title = ({ changeScene }: SceneStore) => (
  <div>
    <h2>title</h2>
    <button onClick={ () => changeScene(Scene.MATCHING) }> start </button>
  </div>
)

export default title