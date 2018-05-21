import * as React from "react";
import { render } from "react-dom";
import { configure } from "mobx";
import { Provider } from "mobx-react";
import App, { AppStore } from "@/app";

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
  document.getElementById("app")
);

/* window.addEventListener('beforeunload', function(e) {
  e.returnValue = 'ゲームを終了しますか？';
}, false); */

const user = localStorage.getItem("user");
if (user != null) {
  store.app.user.updateFromJson(user);
}
