import {globalConfig} from "../services/config.service";
import {OpenAI} from "openai";
import {AiFunction, OpenAiMessage} from "../types";

export const openai = new OpenAI({apiKey: globalConfig.openai.apiKey});

export const functionsModel = "gpt-3.5-turbo-0613"
export const genericCheapModel = "gpt-3.5-turbo"

export class ModelApi {
  openai: OpenAI;

  constructor(private model: "gpt-3.5-turbo-0613" | "gpt-3.5-turbo") {
    this.openai = new OpenAI({apiKey: globalConfig.openai.apiKey});
  }

  async ask<T>(messages: OpenAiMessage[], functions?: AiFunction[]): Promise<{ type: 'function', message: T } | {
    type: 'response',
    message: string
  }> {
    const chatCompletion = await openai.chat.completions.create({
      messages,
      functions,
      model: this.model,
    })
    const tokenizedResponse = chatCompletion.choices[0].message.function_call?.arguments
    const askResponse = chatCompletion.choices[0].message.content
    console.dir({askResponse})
    if (!tokenizedResponse) return {type: 'response', message: askResponse}
    return {type: 'function', message: JSON.parse(tokenizedResponse)}
  }

  async askStream(messages: OpenAiMessage[], handleChunk: (text: string, first: boolean, last: boolean) => (void | PromiseLike<void>)) {
    let first = true
    const stream = await openai.chat.completions.create({
      messages,
      model: this.model,
      stream: true
    })
    for await (const chunk of stream) {
      await handleChunk(chunk.choices[0].delta.content, first, chunk.choices[0].finish_reason === 'stop')
      first = false
    }
  }

}

export const ai = new ModelApi(genericCheapModel);