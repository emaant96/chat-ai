<div class="typing rounded-tl-none px-2 py-1 flex gap-2">
  <div class="typing-dot"></div>
  <div class="typing-dot"></div>
  <div class="typing-dot"></div>
</div>

<style lang="scss">
  .typing {
    .typing-dot {
      animation: typing 1s infinite;
      @apply w-2 h-2 bg-white rounded-full opacity-50;
    }

    .typing-dot:nth-child(1) {
      animation-delay: 0s;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes typing {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(125%);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }
</style>