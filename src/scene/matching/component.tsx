import * as React from "react";
import { inject, observer } from "mobx-react";
import { RootStore, AppStore } from "@/declare";
import SceneModel, { PartyModel, RobbyModel, CreateRoomModel } from "./store";

const matching = ({ app }: any) => {
  const props = app as AppStore
  const matching = app.scene as SceneModel
  return (
    <div>
      <h2>matching</h2>
      { matching.scene instanceof RobbyModel && <RobbyComponent /> }
      { matching.scene instanceof CreateRoomModel && <CreateRoomComponent /> }
      { matching.networkClosed && <div>
        <p>ネットワークが切断されました</p>
        <button onClick={() => props.changeTitleScene()}>戻る</button>
      </div>}
    </div>
  );
};

export default inject("app")(observer(matching));

const robbyComponent = ({ app }: any) => {
  const props = app as AppStore
  const matching = props.scene as SceneModel
  const robby = matching.scene as RobbyModel
  return <div>
    <button onClick={() => props.changeTitleScene()}>back</button>
    <button onClick={() => matching.createRoomForm()}>create room</button>
    {matching.rooms && matching.rooms.map(room =>
      <div key="room.id">
        <span>{room.name}</span>
        <span>
          ({0}/{room.maxUsers})
        </span>
        <span>{room.hasPassword ? "🔒" : ""}</span>
        <button onClick={null}>join</button>
      </div>
    )}
    <div>
      <h3>パーティ</h3>
      <button onClick={() => robby.setIsOpenInviteDialog(true)}>パーティに招待</button>
      {
        robby.isOpenInviteDialog && <div>
          <label>パーティへの招待URL
            <input type="text" readOnly={true} value="TODO" />
          </label>
          <button onClick={() => robby.setIsOpenInviteDialog(false)}>ok</button>
        </div>
      }
    </div>
  </div>
}
const RobbyComponent = inject("app")(observer(robbyComponent))

const createRoomComponent = ({ app }: any) => {
  const props = app as AppStore
  const matching = props.scene as SceneModel
  const createRoom = props.scene as CreateRoomModel
  return <div>
    <div>
      <label>
        部屋の名前:
        <input
        type="text"
        value={matching.scene.name}
        onChange={(e) => { createRoom.name = e.target.value}}
        />
      </label>
    </div>
    <div>
      <label>
        パスワード:
        <input
        type="text"
        value={createRoom.password}
        onChange={(e) => { createRoom.password = e.target.value}}
        />
      </label>
    </div>
    <div>
      <button onClick={() => matching.roomSelect()}>キャンセル</button>
      <button onClick={() => null}>OK</button>
    </div>
  </div>
}
const CreateRoomComponent = inject("app")(observer(createRoomComponent))
