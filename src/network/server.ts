import * as QueryString from 'query-string';

export enum Action {
  GetParty = 'get_party',
  CreateParty = 'create_party',
  JoinParty = 'join_party',
  RequestP2P = 'request_p2p',
  ResponseP2P = 'response_p2p'
}

export enum ConnectionEvent {
  Open = 'open',
  Close = 'close',
  CreateUser = 'create_user',
  ModifyParty = 'modify_party',
  RequestP2P = 'request_p2p',
  ResponseP2P = 'response_p2p'
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
  event: ConnectionEvent;
  status: Status;
  param: any;
  id: string;
}

export interface ResponseParty {
  id: string;
  owner: ResponseUser;
  isPrivate: boolean;
  maxUsers: number;
  users: ResponseUser[];
}

export interface ResponseRequestP2P {
  userId: string;
  offer: string;
}

export interface ResponseResponseP2P {
  userId: string;
  answer: string;
}

export interface ResponseUser {
  id: string;
  name: string;
}

export default class ServerConnection {
  /**
   * WebSocket
   */
  ws: WebSocket;

  _event: {
    [key: string]: { func: ((event: any) => void); once: boolean }[];
  } = {
    [ConnectionEvent.Open]: [],
    [ConnectionEvent.Close]: [],
    [ConnectionEvent.ModifyParty]: [],
    [ConnectionEvent.CreateUser]: [],
    [ConnectionEvent.RequestP2P]: [],
    [ConnectionEvent.ResponseP2P]: []
  };

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
  constructor(wsUrl: string, userName: string) {
    const qs = QueryString.stringify({ userName });
    const ws = new WebSocket(`${wsUrl}?${qs}`);
    ws.onopen = msg => {
      this._handle(ConnectionEvent.Open, msg);
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
      if (json.status != Status.NG) {
        this.callRecieve(json);
      }
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
    switch (response.event) {
      case ConnectionEvent.ModifyParty:
        this._handle(
          ConnectionEvent.ModifyParty,
          response.param as ResponseParty
        );
        break;
      case ConnectionEvent.CreateUser:
        this._handle(
          ConnectionEvent.CreateUser,
          response.param as ResponseUser
        );
        break;
      case ConnectionEvent.RequestP2P:
        this._handle(
          ConnectionEvent.RequestP2P,
          response.param as ResponseRequestP2P
        );
      case ConnectionEvent.ResponseP2P:
        this._handle(
          ConnectionEvent.ResponseP2P,
          response.param as ResponseResponseP2P
        );
    }
  }

  on(handler: string, func: (data: any) => void = null) {
    this._event[handler].push({ func, once: false });
  }

  once(handler: string, func: (data: any) => void = null) {
    this._event[handler].push({ func, once: true });
  }

  off(handler: string, func: (data: any) => void) {
    const index = this._event[handler].findIndex(event => event.func == func);
    delete this._event[handler][index];
  }

  _handle<T>(handler: string, data: T) {
    if (!this._event[handler]) return;
    for (const event of this._event[handler]) {
      event.func(data);
    }
    this._event[handler] = this._event[handler].filter(event => !event.once);
  }

  /**
   * 接続を閉じる
   */
  dispose() {
    this.ws.close();
  }

  /**
   * パーティを作成する
   * @param isPrivate boolean パーティへの参加を禁止します
   * @param maxUsers int ユーザー参加制限 0 以下は無制限
   */
  async createParty(isPrivate = true, maxUsers = 0) {
    return (await this.send(Action.CreateParty, {
      isPrivate: isPrivate,
      maxUsers: maxUsers
    })) as ResponseParty;
  }

  async getParty(partyId: string) {
    return (await this.send(Action.GetParty, {
      partyId
    })) as ResponseParty;
  }

  async joinParty(partyId: string) {
    return (await this.send(Action.JoinParty, {
      partyId
    })) as ResponseParty;
  }

  async requestP2P(userId: string, offer: string) {
    return await this.send(Action.RequestP2P, {
      offer,
      userId
    });
  }
  async responseP2P(userId: string, answer: string) {
    return await this.send(Action.ResponseP2P, {
      answer,
      userId
    });
  }
}
