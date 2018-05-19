import * as React from 'react'
import { Component } from 'react'
import { Scene, SceneStore } from '@/declare'

const matching = ({ changeScene }: SceneStore) => (
  <div>
    <h2>matching</h2>
    <button onClick={ () => changeScene(Scene.TITLE) }> start </button>
  </div>
)

export default matching