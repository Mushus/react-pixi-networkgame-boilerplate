import * as React from "react";
import { inject, observer } from "mobx-react";
import { Scene, RootStore, AppStore } from "@/declare";
import SceneModel, { RobbyModel, CreateRoomModel } from "./store";

const matching = ({ app }: any) => {
  const props = app as AppStore
  const matching = app.scene as SceneModel
  return (
    <div>
      <h2>matching</h2>
      { matching.scene instanceof RobbyModel && <RoomListComponent /> }
      { matching.scene instanceof CreateRoomModel && <CreateRoomComponent /> }
    </div>
  );
};

export default inject("app")(observer(matching));

const roomListComponent = ({ app }: any) => {
  const props = app as AppStore
  const matching = props.scene as SceneModel
  return <div>
    <button onClick={() => matching.createRoomForm()}>create room</button>
      {matching.rooms && matching.rooms.map(room => <div key="room.id">
        <span>{room.name}</span>
        <span>
          ({0}/{room.maxUsers})
        </span>
        <span>{room.hasPassword ? "🔒" : ""}</span>
        <button onClick={null}>join</button>
      </div>
    )}
    <button onClick={() => props.changeTitleScene(Scene.TITLE)}>back</button>
  </div>
}
const RoomListComponent = inject("app")(observer(roomListComponent))

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
