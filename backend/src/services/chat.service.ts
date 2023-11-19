import {OpenAiMessage, StreamAIMessage} from "../types";
import {Socket} from "socket.io";
import {AIMessage} from "model";

export class Chat {

  messageHistory: OpenAiMessage[] = []

  socket: Socket

  constructor(socket: Socket) {
    this.socket = socket
  }

  onMessage(onMessageCallback: (data: Omit<AIMessage, 'role'>, response: (message: StreamAIMessage) => void) => void) {
    this.socket.on("message", (data: Omit<AIMessage, 'role'>) => {
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

  set messages(messages: OpenAiMessage[]) {
    this.messageHistory = messages
  }
}