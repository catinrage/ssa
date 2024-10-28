<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import ProjectItem from '$ui/components/ProjectItem.svelte';
  import autoAnimate from '@formkit/auto-animate';
  import type { PageData } from './$types';

  const { data }: { data: PageData } = $props();

  async function createNewProject() {
    const projectName = prompt('نام پروژه ی جدید را وارد کنید');
    if (!projectName) return;

    const response = await fetch('/api/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName }),
    });
    if (response.ok) {
      invalidateAll();
    }
  }
</script>

<div
  class="eng fixed bottom-3 left-0 z-10 hidden w-full text-center text-xs uppercase text-black/80 sm:block"
>
  taheri engineering group | solidcam setup sheet analyzer v1.0.0
</div>

<div class="grid h-full grid-cols-24 grid-rows-24 gap-3" use:autoAnimate>
  {#each data.projects as project}
    <ProjectItem props={{ ...project }} />
  {/each}
  <button
    class="col-span-4 row-span-4 flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl bg-gray-50 p-3 text-sm shadow-sm duration-100 hover:bg-gray-100"
    onclick={createNewProject}
  >
    <iconify-icon class="text-3xl" icon="basil:add-outline"></iconify-icon>
    <span>ایجاد پروژه ی جدید</span>
  </button>
</div>
