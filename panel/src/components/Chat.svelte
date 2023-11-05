<script lang="ts">
  import {AIMessage} from 'model';
  import Icon from './Icon.svelte';
  import {clientSocketService} from "../services/socket.service";
  import {onMount} from "svelte";

  let messages: AIMessage[] = [];
  let newMessage: AIMessage = {text: '', role: 'user'};

  onMount(() => {
    clientSocketService.subscribe('message', (message: { text: string, first: boolean, last: boolean }) => {
      if (message.first) {
        let newBotMessage = {text: '', role: 'bot'};
        messages = [...messages, newBotMessage];
      } else {
        messages.at(-1).text += message.text || '';
        messages = [...messages];
      }
    })
  })

  $: {
    console.log(messages);
    setTimeout(() => scrollToBottom())
  }


  function scrollToBottom() {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer)
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function sendMessage() {
    messages = [...messages, newMessage];
    clientSocketService.send('message', newMessage.text)
    newMessage = {text: '', role: 'user'};
  }


</script>

<div class="messages-container">
  {#each messages as message}
    <div class="message-container" class:user={message.role === 'user'}>
      {#if message.role === 'bot'}
        <div class="arrow-left"></div>
      {/if}
      <div class="message" class:user={message.role === 'user'}> {message.text} </div>
      {#if message.role === 'user'}
        <div class="arrow-right"></div>
      {/if}
    </div>
  {/each}
</div>

<div class="mt-4 flex gap-2 w-9/12">
  <input class="flex-1" bind:value={newMessage.text} on:keyup={e => e.key === 'Enter' && sendMessage()}
         placeholder="Scrivi un messaggio..."/>
  <button class="send-button" on:click={sendMessage}>
    <Icon name="send" tooltip="Invia il messaggio" color="white"></Icon>
  </button>
</div>

<style lang="postcss">

    @import "../assets/_scrollbar.scss";
    @import "../app.scss";

    .messages-container {
        @apply w-11/12 h-3/5 p-4 bg-white rounded-lg overflow-auto flex flex-col gap-4 scrollbar-sm shadow-clean;
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

    .send-button {
        @apply w-10 shadow-clean rounded-full aspect-square text-white bg-cyan-600 flex justify-center;
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