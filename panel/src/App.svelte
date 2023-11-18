<script lang="ts">
  import Chat from "./components/Chat.svelte";
</script>


<div class="main-container relative">
  <h1>Chat AI</h1>
  <Chat/>
  <button on:click={() => window.location.reload()}>reload</button>
</div>

<style lang="postcss">
    :root {
        width: 100%;
        height: 100%;
    }

    .main-container {
        @apply w-full h-full flex flex-col justify-center items-center pt-10;
    }

    button {
        @apply w-fit absolute top-1 left-1 bg-red-400;
    }

    h1 {
        @apply text-4xl font-bold mb-4 text-cyan-950;
    }

</style>
