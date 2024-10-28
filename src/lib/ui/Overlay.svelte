<script lang="ts">
  import type { Snippet } from 'svelte';

  const { children }: { children: Snippet } = $props();
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[3px]"
>
  {@render children()}
</div>
