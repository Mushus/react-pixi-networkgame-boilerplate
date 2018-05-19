import * as React from "react";
import { inject, observer } from "mobx-react";
import { Scene, SceneStore } from "@/declare";
import Store, { Scene as MatchingScene } from "./store";

const matching = ({ store }: any) => {
  const props = store as SceneStore & { matching: Store };
  return (
    <div>
      <h2>matching</h2>
      { props.matching.scene === MatchingScene.ROOM_SELECT && <RoomListComponent /> }
      { props.matching.scene === MatchingScene.CREATE_ROOM && <CreateRoomComponent /> }
    </div>
  );
};

const roomListComponent = ({ store }: any) => {
  const props = store as SceneStore & { matching: Store };
  return <div>
    <button onClick={() => props.matching.createRoomForm()}>create room</button>
      {props.matching.rooms && props.matching.rooms.map(room => <div key="room.id">
        <span>{room.name}</span>
        <span>
          ({0}/{room.maxUsers})
        </span>
        <span>{room.hasPassword ? "🔒" : ""}</span>
        <button onClick={() => props.matching.joinRoom(room.id)}>join</button>
      </div>
    )}
    <button onClick={() => props.changeTitleScene(Scene.TITLE)}>back</button>
  </div>
}
const RoomListComponent = inject(store => store)(observer(roomListComponent))

const createRoomComponent = ({ store }: any) => {
  const props = store as SceneStore & { matching: Store }
  const createRoom = props.matching.createRoom
  return <div>
    <div>
      <label>
        部屋の名前:
        <input
        type="text"
        value={createRoom.name}
        onChange={(e) => { createRoom.name = e.target.value}}
        autoComplete="off"
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
        autoComplete="nope"
        />
      </label>
    </div>
    <div>
      <button onClick={() => props.matching.roomSelect()}>キャンセル</button>
      <button onClick={() => props.matching.cresponseCreateRoom()}>OK</button>
    </div>
  </div>
}
const CreateRoomComponent = inject(store => store)(observer(createRoomComponent))

export default inject(store => store)(observer(matching));
