<script lang="ts">
  import type {AIMessage, Attachment, StreamAIMessage} from 'model';
  import Icon from './Icon.svelte';
  import {socketService} from "../services/socket.service";
  import {onMount} from "svelte";
  import Typing from "./Typing.svelte";
  import {fileToBase64} from "../functions/file.utils";
  import {notify} from "../stores/notification.store";

  let messages: AIMessage[] = [];
  let newMessage: AIMessage = {text: '', role: 'user', attachments: []};
  let dragEnter = false;

  let loadingResponse = false;

  let textarea: HTMLTextAreaElement;
  let messagesContainer: HTMLDivElement;

  onMount(() => {
    socketService.subscribe('message', (message: StreamAIMessage) => {
      if (message.first) {
        loadingResponse = false
        let newBotMessage: AIMessage = {
          text: message.text,
          role: 'bot',
          src: message.src,
        };
        messages = [...messages, newBotMessage];
      } else {
        messages.at(-1).text += message.text || '';
        messages = [...messages];
      }
    })
  })

  $: {
    console.log(messages)
    setTimeout(scrollToBottom)
  }


  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function sendMessage() {
    textarea.style.height = 'auto'
    messages = [...messages, newMessage];
    socketService.send('message', {text: newMessage.text, attachments: newMessage.attachments})
    newMessage = {text: '', role: 'user', attachments: []};
    loadingResponse = true
  }


  function handleDragEnter(e) {
    console.log(e)
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy'; // show as copy action
    dragEnter = true
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy'; // show as copy action
  }

  function handleDragLeave(e) {
    e.preventDefault();
    dragEnter = false
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragEnter = false
    addAttachment(e.dataTransfer.files[0])
  }

  function handleInput() {
    textarea.style.height = `${textarea.scrollHeight}px`
  }


  function removeAttachment(attachment: Attachment) {
    newMessage.attachments = newMessage.attachments.filter(a => a.id !== attachment.id)
    newMessage.attachments = [...newMessage.attachments]
  }

  async function addAttachment(file: File) {
    if (file.type.indexOf('image') === -1) {
      notify('Only images are supported')
      return
    }
    const attachment = {
      id: newMessage.attachments.length,
      name: file.name,
      file: await fileToBase64(file) as string,
      blob: URL.createObjectURL(file)
    }
    newMessage.attachments = [...newMessage.attachments, attachment]
  }

</script>

<div class="messages-container" bind:this={messagesContainer}>
  {#each messages as message}
    <div class="message-container" class:user={message.role === 'user'}>
      {#if message.role === 'bot'}
        <div class="arrow-left"></div>
      {/if}
      <div class="message" class:user={message.role === 'user'}>
        {#if message.src}
          <img class="rounded-lg" src={'data:image/png;base64,' + message.src} alt="Immagine"/>
        {/if}
        {#if message.attachments?.length > 0}
          <img class="rounded-lg" src={message.attachments[0].blob} alt="Immagine"/>
        {/if}
        {#if message.audio}
          <audio controls>
            <source src="{message.audio}" type="audio/mpeg">
          </audio>
        {/if}
        {@html message.text.replace(/\n/g, "<br>")}
      </div>
      {#if message.role === 'user'}
        <div class="arrow-right"></div>
      {/if}
    </div>
  {/each}
  {#if loadingResponse}
    <div class="message-container">
      <div class="arrow-left"></div>
      <div class="message">
        <Typing/>
      </div>
    </div>
  {/if}
</div>

<div class="utility-container py-4">
  <div class="relative w-full input-container" class:writing={newMessage.text} class:drag-enter={dragEnter}
       class:attachments={newMessage.attachments.length > 0}>
    <div class="absolute flex gap-2 mt-3 ml-3">
      {#each newMessage.attachments as attachment}
        <div class="w-7 h-7 rounded-md shadow-clean relative cursor-pointer">
          <img class="w-full h-full" src={attachment.blob} alt="img"/>
          <div on:click={() => removeAttachment(attachment)} on:keydown={() => {}} role="button" tabindex="0"
               class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-500 flex justify-center items-center">
            <Icon class="w-2 h-2" name="close" color="white" tooltip="remove"/>
          </div>
        </div>
      {/each}
    </div>
    <textarea bind:value={newMessage.text}
              bind:this={textarea}
              class:drag-enter={dragEnter}
              class:attachments={newMessage.attachments.length > 0}
              on:keyup={e => e.key === 'Enter' && sendMessage()}
              placeholder="{dragEnter ? 'Upload a file' : 'Write a message...'}"
              on:input={handleInput}
              on:dragenter={handleDragEnter}
              on:dragover={handleDragOver}
              on:dragleave={handleDragLeave}
              on:drop={handleDrop}
    />
    {#if !dragEnter}
      <input id="file" class="absolute w-0 h-0 opacity-0" type="file"
             on:change={e => addAttachment(e.target['files'][0])}/>
      <label for="file" class="absolute right-3 cursor-pointer">
        <svg class="mt-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
             fill="currentColor">
          <path d="M17 5v12c0 2.757-2.243 5-5 5s-5-2.243-5-5v-12c0-1.654 1.346-3 3-3s3 1.346 3 3v9c0 .551-.449 1-1 1s-1-.449-1-1v-8h-2v8c0 1.657 1.343 3 3 3s3-1.343 3-3v-9c0-2.761-2.239-5-5-5s-5 2.239-5 5v12c0 3.866 3.134 7 7 7s7-3.134 7-7v-12h-2z"/>
        </svg>
      </label>
    {/if}
  </div>

  {#if newMessage.text}
    <button class="send-button" on:click={sendMessage}>
      <Icon name="send" tooltip="Send message" color="white"></Icon>
    </button>
  {/if}
</div>

<style lang="scss">

    @import "../assets/_scrollbar.scss";
    @import "../assets/_animations.scss";
    @import "../app.scss";

    .messages-container {
        @apply w-11/12 flex-1 p-4 bg-white rounded-lg overflow-auto flex flex-col gap-4 scrollbar-sm shadow-clean;
        @apply transition-all duration-300 ease-in-out;
    }

    .message-container {
        @apply flex w-full drop-shadow ;

        &.user {
            @apply justify-end;
        }

        &:not(.user) {
            @apply justify-start;
        }
    }

    .message {
        @apply rounded-2xl p-4 w-2/3 max-w-fit font-bold text-cyan-950;

        &.user {
            @apply bg-orange-200 rounded-tr-none;
        }

        &:not(.user) {
            @apply bg-cyan-200 rounded-tl-none;
        }
    }

    .utility-container {
        @apply flex gap-2 w-10/12 min-h-[100px] max-h-fit transition-all items-center;
    }

    .send-button {
        @apply w-10 shadow-clean rounded-full aspect-square text-white bg-cyan-600 flex justify-center animation-appear;
    }

    textarea {
        @apply w-full h-full transition-all pr-10 resize-none overflow-hidden;

        &.drag-enter {
            @apply flex text-center;
        }

        &.attachments {
            @apply pt-10;
        }
    }

    .input-container {
        @apply transition-all duration-150 ease-in-out;

        &.writing {
            width: calc(100% - 3rem);
        }

        &:not(.writing) {
            @apply w-full;
        }

        &.drag-enter {
            @apply h-full flex text-center;
        }

        &.attachments {
            @apply h-full;
        }
    }

    .arrow-right {
        @apply border-t-8 border-t-orange-200;
        width: 0;
        height: 0;
        border-right: 8px solid transparent;
    }

    .arrow-left {
        @apply border-t-8 border-t-cyan-200;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
    }

</style>