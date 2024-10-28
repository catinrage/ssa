<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import type { SetupSheet } from '@prisma/client';

  type Props = {
    id: string;
    name: string;
    setupSheets: SetupSheet[];
  };

  const { props }: { props: Props } = $props();

  async function deleteProject() {
    const confirmation = confirm('آیا از حذف این پروژه اطمینان دارید؟');
    if (!confirmation) return;
    const response = await fetch(`/api/project/${props.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      invalidateAll();
    }
  }

  async function renameProject() {
    const projectName = prompt('نام جدید پروژه را وارد کنید');
    if (!projectName) return;
    const response = await fetch(`/api/project/${props.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName }),
    });
    if (response.ok) {
      invalidateAll();
    }
  }
</script>

<a
  class="group col-span-4 row-span-4 flex flex-col gap-3 overflow-hidden rounded-xl bg-gray-50 p-3 text-sm shadow-sm duration-100 hover:bg-gray-100"
  href="/project/{props.id}"
>
  <div class="flex w-full items-center gap-2 text-base">
    <iconify-icon class="text-2xl" icon="file-icons:microsoft-project"></iconify-icon>
    <span class="font-bold">{props.name}</span>
    <div class="mr-auto flex items-center gap-2">
      <button
        aria-label="rename"
        class="flex items-center duration-100 hover:text-slate-500"
        onclick={async (event) => {
          event.preventDefault();
          await renameProject();
        }}
      >
        <iconify-icon class="text-lg" icon="fluent:rename-20-regular"></iconify-icon>
      </button>
      <button
        aria-label="delete"
        class="flex items-center duration-100 hover:text-rose-500"
        onclick={async (event) => {
          event.preventDefault();
          await deleteProject();
        }}
      >
        <iconify-icon class="text-lg" icon="solar:trash-bin-minimalistic-2-broken"
        ></iconify-icon>
      </button>
    </div>
  </div>
  <div
    class="eng relative flex grow flex-col gap-1.5 overflow-hidden text-xs text-accent-300 group-hover:text-accent-500"
  >
    {#each props.setupSheets as setupSheet}
      <div class="flex items-center gap-1.5">
        <iconify-icon
          class="relative bottom-px text-lg"
          icon="material-symbols-light:menu-book-outline-rounded"
        ></iconify-icon>
        <span>{setupSheet.name}</span>
      </div>
    {:else}
      <p class="text-zinc-400">خالی</p>
    {/each}
    {#if props.setupSheets.length}
      <div
        class="absolute bottom-0 left-0 h-14 w-full bg-gradient-to-t from-gray-50 to-transparent group-hover:!from-gray-100"
      ></div>
    {/if}
  </div>
</a>
