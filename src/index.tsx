import * as React from 'react';
import { render } from 'react-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import App, { AppStore } from '@/app';
import { STORAGE_KEY_USER, SEARCH_PARAM_INVITE } from '@/declare';
import { SceneModel as MatchingSceneModel } from '@/scene/matching';

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

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has(SEARCH_PARAM_INVITE)) {
  store.app.invite = urlParams.get(SEARCH_PARAM_INVITE);
  // urlパラメータを抜く
  const urlObj = new URL(location.href);
  urlObj.search = '';
  const nonParamUrl = urlObj.toString();
  history.replaceState({}, null, nonParamUrl);
}

const user = localStorage.getItem(STORAGE_KEY_USER);
if (user != null) {
  store.app.user.updateFromJson(user);
  console.log(store.app.invite);
  if (store.app.invite != null) {
    store.app.transitionMatchingScene(new MatchingSceneModel(store.app.invite));
  }
} else {
  store.app.transitionCharaCreate();
}
