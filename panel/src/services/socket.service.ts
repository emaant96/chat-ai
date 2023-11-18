import {io, Socket} from 'socket.io-client';

export class ClientSocketService {
  private socket:Socket

  constructor() {
    this.socket = io(import.meta.env.VITE_SOCKET)
  }

  subscribe(event: string, action: (data) => any) {
    this.socket.on(event, action);
  }

  send<T>(event: string, data: T) {
    this.socket.emit(event, data);
  }

  unsubscribe(event: string, action: (data) => any) {
    this.socket.off(event, action);
  }
}

export const socketService = new ClientSocketService();