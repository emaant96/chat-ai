import {OpenAiMessage} from "../types";
import {Socket} from "socket.io";
import {AIMessage, Attachment, StreamAIMessage} from "model";
import OpenAI from "openai";
import ChatCompletionContentPart = OpenAI.ChatCompletionContentPart;

export class Chat {

  messageHistory: OpenAiMessage[] = []

  socket: Socket

  constructor(socket: Socket) {
    this.socket = socket
  }

  onMessage(onMessageCallback: (data: Omit<AIMessage, 'role'>, response: (message: StreamAIMessage) => void) => void) {
    this.socket.on("message", (data: Omit<AIMessage, 'role'>) => {
      onMessageCallback(data, (message) => this.socket.emit("message", message))
    })
  }

  add: {
    assistant: (content: string) => void,
    user: (content: string) => void,
    system: (content: string) => void,
    function: (name: string, content: string) => void
    attachment: (content: string, attachments: Attachment[]) => void
  } = {
    assistant: (content: string) => this.messageHistory.push({role: 'assistant', content}),
    user: (content: string) => this.messageHistory.push({role: 'user', content}),
    system: (content: string) => this.messageHistory.push({role: 'system', content}),
    function: (name: string, content: string) => this.messageHistory.push({role: 'function', name, content}),
    attachment: (text, attachments) => {

      const attachmentsMessage: ChatCompletionContentPart[] = attachments.map(a => ({
        type: 'image_url',
        image_url: {url: a.file, detail: 'auto'}
      }))

      this.messageHistory.push({role: 'user', content: [{type: 'text', text}, ...attachmentsMessage]})
    }
  }

  get messages() {
    return this.messageHistory
  }

  set messages(messages: OpenAiMessage[]) {
    this.messageHistory = messages
  }
}