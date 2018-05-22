import { parse } from 'querystring';

export enum Action {
  CREATE_PARTY = 'create_party'
}

export enum Status {
  OK = 'ok',
  NG = 'ng'
}

export type Callback<T> = {
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (value?: T | PromiseLike<T>) => void;
};

export interface ResponseJSON {
  action: Action;
  status: Status;
  param: any;
  id: string;
}

export interface ResponseCreateRoom {
  id: string;
  isPrivate: boolean;
  maxUsers: number;
}

export default class ServerConnection {
  /**
   * WebSocket
   */
  ws: WebSocket;

  /**
   * コネクションが開いた時に呼ばれるイベント
   */
  onopen: (e: Event) => void;

  /**
   * コネクションが閉じた時に呼ばれるイベント
   */
  onclose: (e: Event) => void;

  /**
   * リクエストID
   * インクリメントすることで一意のキーを作成します
   */
  requestId: number = 0;

  /**
   * send に対して reseive を紐付けるコールバック
   */
  callbacks = new Map<string, Callback<any>>();

  /**
   * サーバーに接続する
   */
  constructor(wsUrl: string) {
    const ws = new WebSocket(wsUrl);
    ws.onopen = msg => {
      if (this.onopen) this.onopen(msg);
    };
    ws.onmessage = msg => {
      const json = JSON.parse(msg.data) as ResponseJSON;
      const requestId = json.id;
      if (this.callbacks.has(requestId)) {
        const promise = this.callbacks.get(requestId);
        if (json.status == Status.OK) {
          promise.resolve(json.param);
        } else {
          promise.reject(json.param);
        }
        this.callbacks.delete(requestId);
        return;
      }
      this.callRecieve(json);
    };
    ws.onerror = msg => {
      console.log(msg);
    };
    ws.onclose = msg => {
      console.log(msg);
    };
    this.ws = ws;
  }

  /**
   * イベントを送る
   * await対応
   */
  send(action: Action, param: any) {
    const requestId = new Number(this.requestId).toString(36);
    this.ws.send(
      JSON.stringify({
        action: action,
        param: param,
        id: requestId
      })
    );
    this.requestId++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(requestId, { resolve, reject });
    });
  }

  /**
   * 受け取ったjsonのイベントを発行する
   */
  callRecieve(response: ResponseJSON) {
    console.log(response);
  }

  /**
   * 接続を閉じる
   */
  close() {
    this.ws.close();
  }

  /**
   * パーティを作成する
   * @param isPrivate boolean パーティへの参加を禁止します
   * @param maxUsers int ユーザー参加制限 0 以下は無制限
   */
  async createParty(isPrivate = true, maxUsers = 0) {
    return (await this.send(Action.CREATE_PARTY, {
      isPrivate: isPrivate,
      maxUsers: maxUsers
    })) as ResponseCreateRoom;
  }
}
