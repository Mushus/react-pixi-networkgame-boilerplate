import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { AppStore } from '@/declare';
import Store from './store';
import { SceneModel as CharaCreateSceneModel } from '@/scene/characreate';

const title = ({ app }: any) => {
  const props = app as AppStore;
  return (
    <div>
      <h2>title</h2>
      <button onClick={() => props.transitionMatchingScene()}>start</button>
      <button
        onClick={() =>
          props.transitionCharaCreate(new CharaCreateSceneModel(props.user))
        }
      >
        ユーザー設定
      </button>
    </div>
  );
};

export default inject('app')(observer(title));
