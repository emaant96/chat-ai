import {globalConfig} from "../services/config.service";
import {OpenAI} from "openai";
import {AiFunction, AiFunctionEnhanced, OpenAiChunk, OpenAiMessage, OpenAiResponse} from "../../types";
import {Stream} from "openai/streaming";
import * as fs from "fs";
import {StreamAIMessage} from "model";

export const openai = new OpenAI({apiKey: globalConfig.openai.apiKey});

export const functionsModel = "gpt-3.5-turbo-0613"
export const assistantModel = "gpt-3.5-turbo-1106"
export const genericCheapModel = "gpt-3.5-turbo"
export const niceModel = "gpt-4-1106-preview"
export const visionModel = 'gpt-4-vision-preview'

export class GptApi {
  openai: OpenAI;
  private isFunctionCalling: boolean;
  private functionName: string;
  private fullResponse: string;
  private functionResultParsed: string;
  private functionResult: { content: string }

  constructor(private model: "gpt-3.5-turbo-0613" | "gpt-3.5-turbo" | "gpt-4-1106-preview" | 'gpt-4-vision-preview') {
    this.openai = new OpenAI({apiKey: globalConfig.openai.apiKey});
  }

  set modelType(type: "vision" | "text") {
    if (type === "vision") this.model = visionModel
    else this.model = "gpt-3.5-turbo-0613"
  }

  async voice(text: string) {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      response_format: 'mp3',
      input: text
    })
    const buffer = await mp3.buffer()
    fs.writeFileSync('test.mp3', buffer)
    return buffer
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
      max_tokens: 1000,
      functions: functions?.length ? functions.map(f => f.data) : undefined
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
        const data = {text: text || '', first, last: result.finish_reason === 'stop'}
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

  async newThread() {
    const thread = await openai.beta.threads.create();
    return thread.id
  }

  async newAssistant(fileIds: string[]) {
    const assistant = await openai.beta.assistants.create({
      name: "Minimal unique html selector extractor",
      instructions: "You are a html code interpreter that given a description of a html element and his css data can resolve problems that the user ask, once it asked you something it can't give you more informations but you have to resolve the problem without respond surround stuff, only the response at his question",
      tools: [{type: "code_interpreter"}, {type: 'retrieval'}],
      model: assistantModel,
      file_ids: fileIds
    });
    return assistant.id
  }

  async getAssistants() {
    const assistants = await openai.beta.assistants.list()
    return assistants.data.map(a => a.id)
  }

  async addFile(path: string) {
    const file = await openai.files.create({
      file: fs.createReadStream(path),
      purpose: "assistants",
    });
    return file.id
  }

  async addMessageToThread(threadId: string, message: string) {
    await openai.beta.threads.messages.create(
      threadId,
      {role: 'user', content: message}
    );
  }

  async runAssistant(assistantId: string, threadId: string) {
    const run = await openai.beta.threads.runs.create(
      threadId,
      {
        assistant_id: assistantId,
      }
    );
    return run
  }

  async getThreadMessages(threadId: string) {
    const messages = await openai.beta.threads.messages.list(
      threadId
    );
    return messages.data
  }
}

export const gpt = new GptApi(genericCheapModel);