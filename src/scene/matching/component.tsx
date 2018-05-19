import * as React from "react";
import { inject, observer } from "mobx-react";
import { Scene, SceneStore } from "@/declare";
import Store from "./store";

const matching = ({ store }: any) => {
  const props = store as SceneStore;
  return (
    <div>
      <h2>matching</h2>
      <button onClick={() => props.changeTitleScene(Scene.TITLE)}>
        {" "}
        start{" "}
      </button>
    </div>
  );
};

export default inject(store => store)(observer(matching));
