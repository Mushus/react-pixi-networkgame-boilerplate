import * as React from "react";
import { inject, observer } from "mobx-react";
import { AppStore } from "@/declare";
import Store from "./store";

const title = ({ app }: any) => {
  const props = app as AppStore;
  const characreate = props.scene as Store;
  return (
    <div>
      <h2>title</h2>
      <p>おなまえを入力してください</p>
      <input
        type="text"
        value={characreate.user.name}
        onChange={e => characreate.changeUserName(e.target.value)}
      />
      <button
        onClick={() => props.changeMatchingScene()}
        disabled={characreate.user.name != ""}
      >
        OK
      </button>
    </div>
  );
};

export default inject("app")(observer(title));
