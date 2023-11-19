import {Chat} from "./services/chat.service";
import {gpt, GptApi} from "./shared/apis/gpt.api";
import {socketService} from "./shared/services/socket.service";
import {functions} from "./services/ai.functions.service";
import OpenAI from "openai";
import ChatCompletionContentPart = OpenAI.ChatCompletionContentPart;


socketService.onConnection((socket) => {

  const chat = new Chat(socket)

  chat.add(
    {
      role: 'system',
      content: `You are an artificial intelligence that helps people find information, respond
                only specifying the information requested by the user in max 3 sentences.`
    }
  )

  let response: GptApi

  chat.onMessage(async (data, resToClient) => {
    if (data.attachments.length > 0) {
      gpt.modelType = 'vision'
      chat.add(
        {
          role: 'user',
          content: [
            {type: 'text', text: data.text},
            ...data.attachments.map(a => ({type: 'image_url', image_url: {url: a.file, detail: 'auto'}})) as ChatCompletionContentPart[]
          ]
        }
      )
      response = await gpt.multi(chat.messages.filter(m => m.role !== 'function'), resToClient, [])
      chat.messages.pop()
    } else {
      chat.add({role: 'user', content: data.text + '. Current date: ' + new Date().toLocaleString()})
      response = await gpt.multi(chat.messages, resToClient, functions)
    }
    gpt.modelType = 'text'

    response
      .function(async (strRes, name, res) => {
        chat.add({role: 'function', name, content: strRes})

        if (name == 'generateImage') {
          const image = await gpt.imagePrompt(res.content);
          resToClient({text: res.content, src: image.message, first: true})
        } else {
          const fullResponse = await gpt.askStream(chat.messages, resToClient)
          chat.add({role: 'assistant', content: fullResponse})
        }

      })
      .text((res: string) => {
        chat.add({role: 'assistant', content: res})
      })
  })
})