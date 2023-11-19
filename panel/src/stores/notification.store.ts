import { writable } from 'svelte/store';

export const notifications = writable<{text:string}[]>([]);

export function notify(text: string) {
  notifications.update((value) => {
    value.push({ text });
    return value;
  });
}

notifications.subscribe((value) => {
  console.log(value);
}); // logs '0'
