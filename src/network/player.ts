import * as Peer from 'simple-peer';
import ServerConnection, {
  ConnectionEvent as ServerEvent,
  ResponseRequestP2P,
  ResponseResponseP2P
} from '@/network/server';
import * as MsgPack from 'msgpack-lite';

export enum ConnectionEvent {
  Open = 'open',
  Close = 'close',
  Connect = 'connect',
  Error = 'error'
}

export enum Status {
  Connecting = 'connecting',
  Connected = 'connected',
  // TODO: 使ってない
  Closed = 'closed'
}

export default class PlayerConnection {
  serverConnection: ServerConnection;
  peer: Peer.Instance;
  userId: string;
  status: Status;

  _event: {
    [key: string]: { func: ((event: any) => void); once: boolean }[];
  } = {
    [ConnectionEvent.Open]: [],
    [ConnectionEvent.Close]: [],
    [ConnectionEvent.Connect]: [],
    [ConnectionEvent.Error]: []
  };

  constructor(serverConnection: ServerConnection, userId: string) {
    this.serverConnection = serverConnection;
    this.userId = userId;
    this.status = Status.Connecting;
  }

  request() {
    return new Promise(resolve => {
      // (1) STUNサーバーからのsingalを待機
      this.peer = new Peer({ initiator: true, trickle: false });
      // (2) STUNサーバーからのシグナルをゲームサーバーに転送
      this.peer.on('signal', data => {
        if (data.type == 'offer') {
          const offer = JSON.stringify(data);
          this.serverConnection.requestP2P(this.userId, offer);
        }
      });
      // (3) 相手方の応答をSTUNサーバーに送る
      this.serverConnection.once(
        ServerEvent.ResponseP2P,
        (data: ResponseResponseP2P) => {
          const answer = JSON.parse(data.answer);
          this.peer.signal(answer);
        }
      );
      // (4) 接続完了
      this.peer.on('connect', () => {
        this.status = Status.Connected;
        this._handle(ConnectionEvent.Connect, null);
        var raw = new TextEncoder().encode('from sender!');
        this.peer.send(raw);
        resolve();
      });

      this.peer.on('data', (raw: Uint8Array) => {
        const data = MsgPack.decode(raw);
        console.log(data);
      });
    });
  }

  response() {
    return new Promise(resolve => {
      this.peer = new Peer({ initiator: false, trickle: false });
      // (1) 相手方からの接続要求をSTUNサーバーに転送
      this.serverConnection.once(
        ServerEvent.RequestP2P,
        (data: ResponseRequestP2P) => {
          const offer = JSON.parse(data.offer);
          this.peer.signal(data.offer);
        }
      );
      // (2) 帰ってきたシグナルをサーバーに転送
      this.peer.on('signal', data => {
        if (data.type == 'answer') {
          const answer = JSON.stringify(data);
          this.serverConnection.responseP2P(this.userId, answer);
        }
      });
      // (3) 接続完了
      this.peer.on('connect', () => {
        this.status = Status.Connected;
        this._handle(ConnectionEvent.Connect, null);
        var raw = MsgPack.encode({ test: 'from receiver!' });
        this.peer.send(raw);
        resolve();
      });

      this.peer.on('data', (raw: Uint8Array) => {
        const data = MsgPack.decode(raw);
        console.log(data);
      });
    });
  }

  dispose() {
    this.peer.destroy();
    delete this._event;
  }

  on(handler: ConnectionEvent, func: (data: any) => void = null) {
    this._event[handler].push({ func, once: false });
  }

  once(handler: ConnectionEvent, func: (data: any) => void = null) {
    this._event[handler].push({ func, once: true });
  }

  off(handler: ConnectionEvent, func: (data: any) => void) {
    const index = this._event[handler].findIndex(event => event.func == func);
    delete this._event[handler][index];
  }

  _handle<T>(handler: ConnectionEvent, data: T) {
    if (!this._event[handler]) return;
    for (const event of this._event[handler]) {
      event.func(data);
    }
    this._event[handler] = this._event[handler].filter(event => !event.once);
  }
}
