import ServerConnection from "@/network/server";

export class Matching {
  _serverConnection: ServerConnection
  constructor(wsUrl: string, userName: string) {
    this._serverConnection = new ServerConnection(wsUrl, userName)
  }

  dispose() {
    this._serverConnection.dispose()
  }
}