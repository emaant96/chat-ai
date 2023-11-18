<script lang="ts">
  import {afterUpdate} from 'svelte';

  export let name: NotestIcon;
  export let tooltip: string | undefined;
  export let color = 'currentColor';


  let clazz: string = '';
  let defaultClasses = '';
  export {clazz as class};

  afterUpdate(() => {
    if (clazz) {
      const classes = clazz.split(' ');
      const hasHeight = classes.find((c) => c.startsWith('h'));
      const hasWidth = classes.find((c) => c.startsWith('w'));
      const hasColor = classes.find((c) => c.startsWith('text'));
      if (!hasColor) defaultClasses += ' text-gray-400';
      if (!hasWidth) defaultClasses += ' w-6';
      if (!hasHeight) defaultClasses += ' h-6';
    } else defaultClasses += 'text-gray-400  w-6 h-6';
  });

  export const ntIcons = {
    arrowLeft:
      "M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z",
    arrowRight:
      "M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z",
    send: 'M22 12l-20 12 5-12-5-12z',
    close: 'M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z'
  };
  type NotestIcon = keyof typeof ntIcons;
</script>

<div class="hl-icon" title={tooltip}>
  <svg on:mouseup class={(clazz || '') + defaultClasses} viewBox="0 0 24 24" fill="{color}"
       xmlns="http://www.w3.org/2000/svg">
    <path d={ntIcons[name]} stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>

<style lang="postcss">
  .hl-icon {
    @apply inline-block;
  }

  svg {
    @apply inline-block;

  }

  path {
      stroke: none;
  }
  svg.button {
    @apply cursor-pointer opacity-60 hover:opacity-100;
  }
</style>
