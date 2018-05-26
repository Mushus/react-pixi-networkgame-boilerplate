import * as Peer from 'simple-peer';
import ServerConnection from '@/network/server';

export default class PlayerConnection {
  serverConnection: ServerConnection;
  peer: Peer.Instance;
  onerror: (data: any) => void;

  constructor(serverConnection: ServerConnection) {
    this.serverConnection = serverConnection;
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
  }

  request(userId: string) {
    return new Promise(resolve => {
      this.peer = new Peer({ initiator: true, trickle: false });
      this.peer.on('signal', data => {
        if (data.type == 'offer') {
          this.serverConnection.requestP2P(userId);
          resolve(data);
        }
      });
    });
  }

  receive() {}

  dispose() {
    this.peer.destroy();
  }
}
