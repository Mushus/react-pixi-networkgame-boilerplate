import * as React from 'react';
import { render } from 'react-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import App, { AppStore } from '@/app';
import { StorageKeyUser, SearchParamInvite } from '@/declare';
import { SceneModel as MatchingSceneModel } from '@/scene/matching';
import '@/scss';

configure({
  enforceActions: true
});

const store = {
  app: new AppStore()
};

render(
  <Provider {...store}>
    <App />
  </Provider>,
  document.getElementById('app')
);

/* window.addEventListener('beforeunload', function(e) {
  e.returnValue = 'ゲームを終了しますか？';
}, false); */

const urlParams = new URLSearchParams(location.search);
if (urlParams.has(SearchParamInvite)) {
  store.app.invite = urlParams.get(SearchParamInvite);
  // urlパラメータを抜く
  const urlObj = new URL(location.href);
  urlObj.search = '';
  const nonParamUrl = urlObj.toString();
  history.replaceState({}, null, nonParamUrl);
}

const user = localStorage.getItem(StorageKeyUser);
if (user != null) {
  store.app.user.updateFromJson(user);
  // 招待されてたらすぐさまマッチング開始する
  if (store.app.invite != null) {
    store.app.transitionMatchingScene(
      new MatchingSceneModel(store.app.user.name, store.app.invite)
    );
  }
} else {
  store.app.transitionCharaCreate();
}
