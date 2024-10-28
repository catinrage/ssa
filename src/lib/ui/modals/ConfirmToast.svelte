<script lang="ts">
  import { fly } from 'svelte/transition';
</script>

<div
  class="fixed bottom-8 right-8 z-[60] flex animate-pulse items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-1 text-xs text-white shadow-md animate-delay-100 animate-duration-1000 animate-once"
  transition:fly={{ y: 20, duration: 300 }}
>
  <div class="flex min-w-4 items-center">
    <iconify-icon class="text-base" icon="line-md:check-all"></iconify-icon>
  </div>
  <span>با موفقیت انجام شد</span>
</div>
