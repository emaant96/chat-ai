import {OpenAiMessage, StreamAIMessage} from "../types";
import {Socket} from "socket.io";

export class Chat {

  messageHistory: OpenAiMessage[] = []

  socket: Socket

  constructor(socket: Socket) {
    this.socket = socket
  }

  onMessage(onMessageCallback: (data: string, response: (message: StreamAIMessage) => void) => void) {
    this.socket.on("message", (data) => {
      onMessageCallback(data, (message) => this.response(message))
    })
  }

  response(data: StreamAIMessage) {
    this.socket.emit("message", data)
    return;
  }

  add(param: OpenAiMessage) {
    this.messageHistory.push(param)
  }

  get messages() {
    return this.messageHistory
  }
}