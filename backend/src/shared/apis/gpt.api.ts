import {globalConfig} from "../services/config.service";
import {OpenAI} from "openai";
import {AiFunction, OpenAiMessage, OpenAiResponse, StreamAIMessage} from "../../types";

export const openai = new OpenAI({apiKey: globalConfig.openai.apiKey});

export const functionsModel = "gpt-3.5-turbo-0613"
export const genericCheapModel = "gpt-3.5-turbo"

export class GptApi {
  openai: OpenAI;

  constructor(private model: "gpt-3.5-turbo-0613" | "gpt-3.5-turbo") {
    this.openai = new OpenAI({apiKey: globalConfig.openai.apiKey});
  }

  async ask<T>(messages: OpenAiMessage[], functions?: AiFunction[]): Promise<OpenAiResponse<T>> {
    const {choices: [response]} = await openai.chat.completions.create({messages, functions, model: this.model})

    if (response.finish_reason === 'stop') {
      return {type: 'response', message: response.message.content}
    } else {
      return {type: 'function', message: JSON.parse(response.message.function_call.arguments)}
    }
  }

  async askStream(messages: OpenAiMessage[], handleChunk: (data: StreamAIMessage) => (void | PromiseLike<void>), functions?: AiFunction[]) {
    let fullResponse = ""
    let first = true
    const stream = await openai.chat.completions.create({messages, model: this.model, stream: true, functions})

    for await (const chunk of stream) {
      const [result] = chunk.choices
      const text = result.delta.content
      fullResponse += text

      const data = {text, first, last: result.finish_reason === 'stop'}

      await handleChunk(data)

      first = false
    }
    return fullResponse
  }
}

export const gpt = new GptApi(genericCheapModel);