import {Chat} from "./services/chat.service";
import {gpt} from "./shared/apis/gpt.api";
import {socketService} from "./shared/services/socket.service";
import {functions} from "./services/ai.functions.service";


socketService.onConnection((socket) => {
  console.log("connected", socket.handshake.address)

  const chat = new Chat(socket)

  chat.add(
    {
      role: 'system',
      content: `Sei un intelligenza artificiale che aiuta le persone a trovare informazioni sulle aziende, rispondi 
                specificando soltanto le informazioni richieste dall'utente`
    }
  )

  // chat.onMessage(async (data, resToClient) => {
  //   chat.add({role: 'user', content: data + '. Current date: ' + new Date().toLocaleString()})
  //
  //   const response = await gpt.askMulti<{ company_name: string } | {
  //     prompt: string
  //   }>(chat.messages, resToClient, functions.map(func => func.data))
  //
  //   if (response.type === 'function' && response.name === 'getInfoCompany' && "company_name" in response.message) {
  //     const {company_name} = response.message
  //     const {success, content} = await utils.getCompanyInfo(company_name)
  //     if (!success) {
  //       chat.add({role: 'assistant', content: content as string})
  //       resToClient({text: chat.messages.at(-1).content as string, first: true})
  //     } else if (success) {
  //       chat.add({role: 'function', name: 'getInfoCompany', content: JSON.stringify(content)})
  //       const response = await gpt.askStream(chat.messages, resToClient)
  //       chat.add({role: 'assistant', content: response})
  //     }
  //   } else if (response.type == 'function' && response.name == 'generateImage' && "prompt" in response.message) {
  //     console.log(response.message.prompt)
  //     chat.add({role: 'function', name: 'generateImage', content: response.message.prompt})
  //     const image = await gpt.imagePrompt(response.message.prompt);
  //     resToClient({text: response.message.prompt, src: image.message, first: true})
  //   } else if (response.type === 'response') {
  //     chat.add({role: 'assistant', content: response.message})
  //   }
  // })

  chat.onMessage(async (data, resToClient) => {
    chat.add({role: 'user', content: data + '. Current date: ' + new Date().toLocaleString()})

    await gpt.askMulti2(chat.messages, resToClient, functions).then(async (response) => {
      response
        .function((res: string) => {
          console.log('func', res)
        })
        .text((res: string) => {
          console.log('text', res)
        })
    })


  })
})

