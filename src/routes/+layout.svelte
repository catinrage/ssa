<script lang="ts">
  import 'iconify-icon';
  import 'vazirmatn/Vazirmatn-font-face.css';
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/animations/shift-away.css';
  import 'tippy.js/themes/light.css';
  import '../app.css';
  import { setConfirmToastManager } from '$lib/managers/confirmToastManager.svelte';
  import ConfirmToast from '$ui/modals/ConfirmToast.svelte';

  const { children } = $props();

  const confirmToastManager = setConfirmToastManager();
</script>

<main class="h-full w-full bg-white p-8">
  {@render children()}
</main>

{#if confirmToastManager.showing}
  <ConfirmToast />
{/if}
