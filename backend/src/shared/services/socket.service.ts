import {Server, Socket} from "socket.io";

export class SocketService{
  private io: Server;

  constructor(port: number){
    this.io = new Server(port);
  }

  public onConnection(callback: (socket: Socket) => void){
    this.io.on("connection", callback);
  }

  public on(event: string, callback: (data: any) => void){
    this.io.on(event, callback);
  }

  public off(event: string, callback: (data: any) => void){
    this.io.off(event, callback);
  }

  public emit(event: string, data: any){
    this.io.emit(event, data);
  }
}

export const socket = new SocketService(3005);