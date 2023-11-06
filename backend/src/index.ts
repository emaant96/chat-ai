import {Chat} from "./services/chat.service";
import {gpt} from "./shared/apis/gpt.api";
import {socketService} from "./shared/services/socket.service";
import {functions} from "./services/ai.functions.service";
import {ai} from "./services/ai.service";


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

  chat.onMessage(async (data, resToClient) => {
    chat.add({role: 'user', content: data})

    const response = await gpt.ask<{ company_name: string }>(chat.messages, functions.map(func => func.data))
    if (response.type === 'function') {
      const {company_name} = response.message
      const {success, content} = await ai.getCompanyInfo(company_name)
      if (!success) {
        chat.add({role: 'assistant', content: content as string})
      } else if (success) {
        chat.add({role: 'function', name: 'getInfoCompany', content: JSON.stringify(content)})
        const response = await gpt.askStream(chat.messages, resToClient)
        chat.add({role: 'assistant', content: response})
      }
    } else if (response.type === 'response') {
      chat.add({role: 'assistant', content: response.message})
    }
    resToClient({text: chat.messages.at(-1).content, first: true})

  })
})

