<script lang="ts">
  import {notifications} from "../stores/notification.store.js";

  let notificationsToShow: { text: string }[] = []

  notifications.subscribe(notifications => {
    if (notifications.length === 0) return
    notificationsToShow.push(notifications.at(-1))
    updateView()
    setTimeout(() => {
      notificationsToShow.shift()
      updateView()
    }, 2000)
  });

  let updateView = () => {
    notificationsToShow = [...notificationsToShow]
  }


</script>

<div class="flex flex-col absolute z-50 top-2 right-2 h-0 gap-2">

  {#each notificationsToShow as notification}
    <div class="w-fit h-fit p-4 rounded-xl shadow-clean bg-red-600 opacity-80 text-white">
      {notification.text}
    </div>
  {/each}
</div>