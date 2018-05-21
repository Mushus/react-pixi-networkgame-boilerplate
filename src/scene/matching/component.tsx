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
    <div>
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
        <div>
          <h3>パーティ</h3>
          <div>{matching.party.id}</div>
          <div>{'' + matching.party.isPrivate}</div>
          <div>{'' + matching.party.maxUsers}</div>
          {!robby.isOpenInviteDialog && (
            <button onClick={() => robby.setIsOpenInviteDialog(true)}>
              パーティに招待
            </button>
          )}
          {robby.isOpenInviteDialog && (
            <div>
              <label>
                パーティへの招待URL
                <input
                  type="text"
                  readOnly={true}
                  value={`${location.href}?invite=${matching.party.id}`}
                />
              </label>
              <button onClick={() => robby.setIsOpenInviteDialog(false)}>
                共有を停止
              </button>
            </div>
          )}
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
          matching.party.users.map(user => <div>{user.name}</div>)}
      </div>
      <button onClick={() => matching.transitionRobby()}>戻る</button>
    </div>
  );
};

const PrivateMatchComponent = inject('app')(observer(privateMatchComponent));
