import {Chat} from "./services/chat.service";
import {gpt} from "./shared/apis/gpt.api";
import {socketService} from "./shared/services/socket.service";
import {functions} from "./services/ai.functions.service";


socketService.onConnection((socket) => {

  const chat = new Chat(socket)

  chat.add(
    {
      role: 'system',
      content: `Sei un intelligenza artificiale che aiuta le persone a trovare informazioni sulle aziende, rispondi 
                specificando soltanto le informazioni richieste dall'utente`
    }
  )

  chat.onMessage(async (data, resToClient) => {
    chat.add({role: 'user', content: data + '. Current date: ' + new Date().toLocaleString()})

    const response = await gpt.multi(chat.messages, resToClient, functions)

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