import * as Peer from 'simple-peer';
import ServerConnection, {
  ConnectionEvent,
  ResponseRequestP2P,
  ResponseResponseP2P
} from '@/network/server';

export default class PlayerConnection {
  serverConnection: ServerConnection;
  peer: Peer.Instance;
  userId: string;
  onerror: (data: any) => void;

  constructor(serverConnection: ServerConnection, userId: string) {
    this.serverConnection = serverConnection;
    this.userId = userId;
  }

  createPeer(initiator: boolean) {
    this.peer = new Peer({ initiator });
    this.peer.on('error', data => {
      console.log('error', data);
    });
    this.peer.on('signal', data => {
      console.log('signal', data);
      if (data.type == 'offer') {
        //peer.signal(data);
      }
      if (data.type == 'answer') {
        this.peer.signal(data);
      }
    });
    this.peer.on('connect', data => {
      console.log('connect', data);
    });
    this.peer.on('data', data => {
      console.log('data', data);
    });

    console.log(initiator);
    if (!initiator) {
      console.log(initiator);
      this.serverConnection.once(
        ConnectionEvent.RequestP2P,
        (data: ResponseRequestP2P) => {
          console.log(data);
        }
      );
    }
  }

  request(userId: string) {
    return new Promise(resolve => {
      // (1) STUNサーバーからのsingalを待機
      this.peer = new Peer({ initiator: true, trickle: false });
      // (2) STUNサーバーからのシグナルをゲームサーバーに転送
      this.peer.on('signal', data => {
        if (data.type == 'offer') {
          const offer = JSON.stringify(data);
          this.serverConnection.requestP2P(userId, offer);
        }
      });
      // (3) 相手方の応答をSTUNサーバーに送る
      this.serverConnection.once(
        ConnectionEvent.ResponseP2P,
        (data: ResponseResponseP2P) => {
          const answer = JSON.parse(data.answer);
          this.peer.signal(answer);
        }
      );
      // (4) 接続完了
      this.peer.on('connect', () => {
        var raw = new TextEncoder().encode('from sender!');
        this.peer.send(raw);
        resolve();
      });

      this.peer.on('data', (data: Uint8Array) => {
        const json = new TextDecoder('utf-8').decode(data);
        console.log(json);
      });
    });
  }

  response() {
    return new Promise(resolve => {
      this.peer = new Peer({ initiator: false, trickle: false });
      // (1) 相手方からの接続要求をSTUNサーバーに転送
      this.serverConnection.once(
        ConnectionEvent.RequestP2P,
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
        var raw = new TextEncoder().encode('from receiver!');
        this.peer.send(raw);
        resolve();
      });

      this.peer.on('data', (data: Uint8Array) => {
        const json = new TextDecoder('utf-8').decode(data);
        console.log(json);
      });
    });
  }

  dispose() {
    this.peer.destroy();
  }
}
