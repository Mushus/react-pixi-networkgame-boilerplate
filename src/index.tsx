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
