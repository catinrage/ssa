<script lang="ts">
  import type { ModelSetupSheet } from '$lib/models/setupSheet.svelte';
  import { getProjectManager } from '$lib/managers/projectManager.svelte';
  import tippy from 'svelte-tippy';

  type Props = {
    setupSheet: ModelSetupSheet;
  };

  let { props }: { props: Props } = $props();

  const projectManager = getProjectManager();
</script>

<div
  class="flex items-start gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs duration-150"
  class:opacity-40={props.setupSheet.ignored}
  class:-translate-x-3={props.setupSheet.highlighted}
  class:!bg-accent-100={props.setupSheet.highlighted}
>
  <iconify-icon
    class="relative bottom-px text-2xl"
    icon="material-symbols-light:menu-book-outline-rounded"
  ></iconify-icon>
  <div class="flex grow flex-col items-start overflow-hidden">
    <span dir="ltr" class="eng line-clamp-1 break-all" title={props.setupSheet.name}
      >{props.setupSheet.name}</span
    >
    <span dir="ltr" class="eng text-us text-zinc-500">{props.setupSheet.fileName}</span>
  </div>
  <div class="mr-auto flex gap-1.5">
    <input
      dir="ltr"
      class="eng w-6 rounded bg-transparent text-center text-xs font-bold text-black/50 focus:bg-zinc-200 focus:outline-none"
      type="number"
      bind:value={props.setupSheet.scale}
      oninput={(event) => {
        props.setupSheet.setScale(Number((event.target as HTMLInputElement)?.value) || 1);
      }}
      onwheel={() => {}}
      min="1"
    />

    {#if props.setupSheet.ignored}
      <button
        aria-label="undo-ignore"
        class="flex items-center opacity-50 duration-100 hover:opacity-100"
        onclick={(event) => {
          if (event.ctrlKey) {
            projectManager.ignoreAllExcept(props.setupSheet.id);
          } else {
            projectManager.unIgnoreSetupSheet(props.setupSheet.id);
          }
        }}
        use:tippy={{ content: 'محاسبه این فایل' }}
        tabindex="-1"
      >
        <iconify-icon class="text-sm" icon="lets-icons:view-hide-light"></iconify-icon>
      </button>
    {:else}
      <button
        aria-label="ignore"
        class="flex items-center opacity-50 duration-100 hover:opacity-100"
        onclick={(event) => {
          if (event.ctrlKey) {
            projectManager.ignoreAllExcept(props.setupSheet.id);
          } else {
            projectManager.ignoreSetupSheet(props.setupSheet.id);
          }
        }}
        use:tippy={{ content: 'نادیده گرفتن این فایل' }}
        tabindex="-1"
      >
        <iconify-icon class="text-sm" icon="lets-icons:eye-light"></iconify-icon>
      </button>
    {/if}

    <button
      aria-label="delete"
      class="flex items-center opacity-50 duration-100 hover:opacity-100"
      onclick={() => {
        projectManager.deleteSetupSheet(props.setupSheet.id);
      }}
      use:tippy={{ content: 'حذف از لیست' }}
      tabindex="-1"
    >
      <iconify-icon class="text-base" icon="material-symbols-light:close-rounded"
      ></iconify-icon>
    </button>
  </div>
</div>
