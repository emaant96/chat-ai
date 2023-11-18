import {globalConfig} from "../services/config.service";
import {OpenAI} from "openai";
import {AiFunction, AiFunctionEnhanced, OpenAiChunk, OpenAiMessage, OpenAiResponse, StreamAIMessage} from "../../types";
import {Stream} from "openai/streaming";

export const openai = new OpenAI({apiKey: globalConfig.openai.apiKey});

export const functionsModel = "gpt-3.5-turbo-0613"
export const genericCheapModel = "gpt-3.5-turbo"
export const niceModel = "gpt-4-1106-preview"

export class GptApi {
  openai: OpenAI;
  private isFunctionCalling: boolean;
  private functionName: string;
  private fullResponse: string;
  private functionResultParsed: string;
  private functionResult: { content: string }

  constructor(private model: "gpt-3.5-turbo-0613" | "gpt-3.5-turbo" | "gpt-4-1106-preview") {
    this.openai = new OpenAI({apiKey: globalConfig.openai.apiKey});
  }

  async ask<T>(messages: OpenAiMessage[], functions?: AiFunction[]): Promise<OpenAiResponse<T>> {
    const {choices: [response]} = await openai.chat.completions.create({messages, functions, model: this.model})

    if (response.finish_reason === 'stop') {
      return {type: 'response', message: response.message.content}
    } else {
      return {
        type: 'function',
        message: JSON.parse(response.message.function_call.arguments),
        name: response.message.function_call.name
      }
    }
  }

  async askMulti<T>(
    messages: OpenAiMessage[],
    handleChunk: (data: StreamAIMessage) => (void | PromiseLike<void>),
    functions?: AiFunction[]
  ): Promise<OpenAiResponse<T>> {

    const stream = await openai.chat.completions.create({messages, model: this.model, stream: true, functions})

    let {isFunctionCalling, functionName, fullResponse} = await this.handleGPTResponse(stream, handleChunk);


    if (isFunctionCalling)
      return {type: 'function', message: JSON.parse(fullResponse), name: functionName}
    else
      return {type: 'response', message: fullResponse}
  }

  async multi(
    messages: OpenAiMessage[],
    handleChunk: (data: StreamAIMessage) => (void | PromiseLike<void>),
    functions?: AiFunctionEnhanced[]
  ) {

    const stream = await openai.chat.completions.create({
      messages,
      model: this.model,
      stream: true,
      functions: functions.map(f => f.data)
    })

    let {isFunctionCalling, functionName, fullResponse} = await this.handleGPTResponse(stream, handleChunk);

    let functionResult = null
    if (isFunctionCalling) {
      const func = functions.find(f => f.data.name === functionName)
      const args = Object.values(JSON.parse(fullResponse)) as string[]
      functionResult = await func.exec(...args)
    }

    this.isFunctionCalling = isFunctionCalling
    this.functionName = functionName
    this.fullResponse = fullResponse
    this.functionResultParsed = JSON.stringify(functionResult)
    this.functionResult = functionResult
    return this
  }


  function(cb: (sP: string, name: string, s: { content: any }) => any) {
    if (this.isFunctionCalling) cb(this.functionResultParsed, this.functionName, this.functionResult)
    return this
  }

  text(cb: (s: string) => any) {
    if (!this.isFunctionCalling) cb(this.fullResponse)
    return this
  }

  img(cb: (s: string) => any) {
    if (!this.isFunctionCalling) cb(this.fullResponse)
    return this
  }

  private async handleGPTResponse(stream: Stream<OpenAiChunk>, handleChunk: (data: StreamAIMessage) => (void | PromiseLike<void>)) {
    let isFunctionCalling = false
    let functionName = ""
    let fullResponse = ""
    let first = true
    for await (const {choices: [result]} of stream) {

      if (result.delta.function_call) {
        functionName = functionName || result.delta.function_call.name
        isFunctionCalling = true
      }

      const text = isFunctionCalling ? result.delta.function_call?.arguments : result.delta.content
      fullResponse += text || ""

      if (!isFunctionCalling) {
        const data = {text, first, last: result.finish_reason === 'stop'}
        await handleChunk(data)
        first = false
      }
    }
    console.log({isFunctionCalling, functionName, fullResponse})
    return {isFunctionCalling, functionName, fullResponse};
  }

  async askStream(messages: OpenAiMessage[], handleChunk: (data: StreamAIMessage) => (void | PromiseLike<void>), functions?: AiFunction[]) {
    const stream = await openai.chat.completions.create({messages, model: this.model, stream: true, functions})

    let fullResponse = ""
    let first = true
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

  async imagePrompt(prompt: string) {
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      response_format: 'b64_json',
      n: 1
    });
    return {type: 'response', message: image.data[0].b64_json};
  }
}

export const gpt = new GptApi(niceModel);