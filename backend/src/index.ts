import {Chat} from "./services/chat.service";
import {gpt} from "./shared/apis/gpt.api";
import {socket} from "./shared/services/socket.service";


// socket.onConnection((socket) => {
//
//   const chat = new Chat(socket)
//
//   chat.add.system(
//     `You are an artificial intelligence that helps people find information,
//      respond only specifying the information requested by the user in max 3 sentences.
//      You have the possibility to search on Google using the function searchOnGoogle, so if you don't know the answer
//      (because is too recent for example) search on Google using the function searchOnGoogle so you receive some last info and you can answer the user.
//      In your responses, to add a line break, use special character <br>, every time there is a url reference insert it in the message like a link,
//      use the special character <a href="Reference link">Link title description</a>,
//      highlight the most important words in the sentence with the special character <b>important word</b>
//      and if you can, organize the response in a list by using a line break with the special character <br> and placing a hyphen in front of each item on the list
//      `
//   )
//
//   let response: GptApi
//
//   chat.onMessage(async (data, resToClient) => {
//     if (data.attachments.length > 0) {
//       gpt.modelType = 'vision'
//       chat.add.attachment(data.text, data.attachments)
//       response = await gpt.multi(chat.messages.filter(m => m.role !== 'function'), resToClient, [])
//       chat.messages.pop()
//     } else {
//       chat.add.user(data.text)
//       response = await gpt.multi(chat.messages, resToClient, functions)
//     }
//     gpt.modelType = 'text'
//
//     response
//       .function(async (strRes, name, res) => {
//         chat.add.function(name, strRes)
//
//         if (name == 'generateImage') {
//           const image = await gpt.imagePrompt(res.content);
//           resToClient({text: res.content, src: image.message, first: true})
//         } else {
//           const fullResponse = await gpt.askStream(chat.messages, resToClient)
//           chat.add.assistant(fullResponse)
//         }
//       })
//       .text((res: string) => chat.add.assistant(res))
//   })
// })

socket.onConnection(async (socket) => {
  const chat = new Chat(socket)
  console.log(socket.id)

  // const id1 = await gpt.addFile(process.cwd() + '/src/shared/assets/Smith.html')
  // const id2 = await gpt.addFile(process.cwd() + '/src/shared/assets/styles.81385e70ec968889.css')

  const assistantId = await gpt.newAssistant(['file-cnV0ENAicFUX2dtx5erlqccL', 'file-meBygYQgzfiSZjkbgNdS2jaY'])

  console.log('assistantId: ', assistantId)

  // const [assistantId] = await gpt.getAssistants()

  const threadId = await gpt.newThread()

  console.log('threadId: ', threadId)

  let intervalId: NodeJS.Timeout

  chat.onMessage(async (data, resToClient) => {
    clearInterval(intervalId)
    try {
      await gpt.addMessageToThread(threadId, data.text)
      const result = await gpt.runAssistant(assistantId, threadId)
      console.dir(result, {depth: null})
      console.log('data:', assistantId, threadId)


      let messagesNumber = 0
      intervalId = setInterval(async () => {
        let messages = await gpt.getThreadMessages(threadId)
        messages = messages.filter((m) => m.role == 'assistant' && 'text' in m.content[0] && m.content[0].text.value)
        console.log(messages.length)
        if (messages.length > messagesNumber) {
          resToClient({text: messages[0].content[0]['text'].value, first: true, last: true})
          messagesNumber = messages.length
        }
      }, 5000)
    } catch (e) {
      resToClient({
        text: "wait, i'm thinking",
        first: true,
        last: true
      })
    }
  })
})