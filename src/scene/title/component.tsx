import * as React from "react";
import { inject, observer } from "mobx-react";
import { Scene, RootStore, AppStore } from "@/declare";
import Store from "./store";

const title = ({ app }: any) => {
  const props = app as AppStore;
  return (
    <div>
      <h2>title</h2>
      <button onClick={() => props.changeMatchingScene()}>
        start
      </button>
    </div>
  );
};

export default inject("app")(observer(title));
