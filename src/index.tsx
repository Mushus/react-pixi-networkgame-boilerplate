import * as React from "react";
import { render } from "react-dom";
import { Provider } from "mobx-react";
import App, { AppStore } from "@/app";

const store = new AppStore();

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app")
);
