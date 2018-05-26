import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { RootStore, AppStore } from '@/declare';
import SceneModel, {
  PartyModel,
  RobbyModel,
  PublicMatchModel,
  PrivateMatchModel
} from './store';

const matching = ({ app }: any) => {
  const props = app as AppStore;
  const matching = app.scene as SceneModel;
  return (
    <div className="matching-scene">
      <h2>matching</h2>
      <p>{props.user.name}さんようこそ</p>
      {matching.scene instanceof RobbyModel && <RobbyComponent />}
      {matching.scene instanceof PublicMatchModel && <PublicMatchComponent />}
      {matching.scene instanceof PrivateMatchModel && <PrivateMatchComponent />}
      {matching.networkClosed && (
        <div>
          <p>ネットワークが切断されました</p>
          <button onClick={() => props.transitionTitleScene()}>戻る</button>
        </div>
      )}
    </div>
  );
};
export default inject('app')(observer(matching));

const robbyComponent = ({ app }: any) => {
  const props = app as AppStore;
  const matching = props.scene as SceneModel;
  const robby = matching.scene as RobbyModel;
  return (
    <div>
      <h3>ロビー</h3>
      <button onClick={() => props.transitionTitleScene()}>
        タイトルに戻る
      </button>
      <button onClick={() => matching.transitionPublicMatch()}>
        公開マッチ
      </button>
      <button onClick={() => matching.transitionPrivateMatch()}>
        プライベートマッチ
      </button>
      {matching.party && (
        <div className="party">
          <h3 className="party__title">パーティ</h3>
          <ul className="party__member-list">
            {matching.party.users.map((user, key) => (
              <li className="party__member" key={user.id}>
                {user.isMe && (
                  <i className="material-icons icon--text">favorite_border</i>
                )}
                <i className="material-icons icon--text">
                  check_circle_outline
                </i>
                <i className="material-icons icon--text">loop</i>
                <i className="material-icons icon--text">error_outline</i>
                {user.name}
                {matching.party.owner.id == user.id && (
                  <i className="material-icons icon--text">grade</i>
                )}
              </li>
            ))}
          </ul>
          <div className="party__user-count">
            ({'' + matching.party.users.length}/{matching.party.maxUsers == 0
              ? '?'
              : matching.party.maxUsers})
          </div>
          <div className="party__controlls">
            {matching.party.isPrivate ? (
              <button className="party__controlls__button">
                <i className="material-icons icon--medium">lock</i>
              </button>
            ) : (
              <button>
                <i className="material-icons icon--medium">lock_open</i>
              </button>
            )}
          </div>
          <div>
            <div className="input-group">
              <input
                type="text"
                readOnly={true}
                value={`${location.href}?invite=${matching.party.id}`}
              />
              <button>
                <i className="material-icons icon--medium">link</i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RobbyComponent = inject('app')(observer(robbyComponent));

const publicMatchComponent = ({ app }: any) => {
  const props = app as AppStore;
  const matching = props.scene as SceneModel;
  return (
    <div>
      <h3>公開マッチ</h3>
      <div>
        {matching.party &&
          matching.party.users &&
          matching.party.users.map(user => <div>{user.name}</div>)}
      </div>
      <button onClick={() => matching.transitionRobby()}>戻る</button>
    </div>
  );
};

const PublicMatchComponent = inject('app')(observer(publicMatchComponent));

const privateMatchComponent = ({ app }: any) => {
  const props = app as AppStore;
  const matching = props.scene as SceneModel;
  return (
    <div>
      <h3>プライベートマッチ</h3>
      <div>
        {matching.party &&
          matching.party.users &&
          matching.party.users.map(user => (
            <div>
              {matching.party.owner.id == user.id && <span>👑</span>}
              {user.name}
            </div>
          ))}
      </div>
      <button onClick={() => matching.transitionRobby()}>戻る</button>
    </div>
  );
};

const PrivateMatchComponent = inject('app')(observer(privateMatchComponent));
