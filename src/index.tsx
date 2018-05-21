import * as React from 'react';
import { render } from 'react-dom';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import App, { AppStore } from '@/app';
import { STORAGE_KEY_USER } from '@/declare';

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

const user = localStorage.getItem(STORAGE_KEY_USER);
if (user != null) {
  store.app.user.updateFromJson(user);
} else {
  store.app.transitionCharaCreate();
}
