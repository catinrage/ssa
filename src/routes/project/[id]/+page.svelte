<script lang="ts">
  import { Helper } from '$lib/helpers';
  import type { ProjectManagerSortOptions } from '$lib/models/project.svelte';
  import { setProjectManager } from '$lib/managers/projectManager.svelte';
  import RecordItem from '$ui/components/RecordItem.svelte';
  import SetupSheetItem from '$ui/components/SetupSheetItem.svelte';
  import autoAnimate from '@formkit/auto-animate';
  import type { OperationEnum } from '@prisma/client';
  import { onMount, untrack } from 'svelte';
  import tippy from 'svelte-tippy';
  import { fade } from 'svelte/transition';
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';
  import { getConfirmToastManager } from '$lib/managers/confirmToastManager.svelte';

  /**
   *
   * TODO: better error handling, and also if a operation type is not defined, make it ask user on fly which operation it belongs to, and add an option to add a new mapper (flag) *
   */

  const { data }: { data: PageData } = $props();

  let loading = $state(true);
  let showingSetupSheetMenu = $state(true);

  onMount(() => {
    loading = false;
  });

  let projectManager = $state(setProjectManager(data.project!));
  const confirmToastManager = getConfirmToastManager();

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    data;
    const sortOptions = untrack(() =>
      JSON.parse(JSON.stringify(projectManager.sortOptions)),
    );
    projectManager = untrack(() => setProjectManager(data.project!));
    setTimeout(() => {
      projectManager.sortBy(sortOptions.column, sortOptions.order);
    });
  });

  function loadSetupSheetsFromFile(this: HTMLInputElement) {
    const files = this.files;
    if (!files) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target?.result;
        if (typeof fileContent === 'string') {
          await projectManager.addSetupSheet(fileContent, file.name);
        }
      };
      reader.readAsText(file);
    }
    this.value = '';
  }

  let tableHead: HTMLElement;
  let tableBody: HTMLElement;

  function syncTableHeadHorizontalScroll() {
    tableHead.scrollLeft = tableBody.scrollLeft;
  }

  function syncTableBodyHorizontalScroll() {
    tableBody.scrollLeft = tableHead.scrollLeft;
  }

  function updateTableExtendsOn() {
    tableExtendsOn.left =
      tableBody.scrollLeft - 1 > tableBody.clientWidth - tableBody.scrollWidth;
    tableExtendsOn.right = tableBody.scrollLeft < 0;
    tableExtendsOn.bottom =
      tableBody.scrollTop < tableBody.scrollHeight - tableBody.clientHeight;
  }

  function sortBy(column: ProjectManagerSortOptions['column']) {
    if (projectManager.sortOptions.column === column) {
      projectManager.sortBy(
        column,
        projectManager.sortOptions.order === 'asc' ? 'desc' : 'asc',
      );
    } else {
      projectManager.sortBy(column, 'asc');
    }
  }

  let tableExtendsOn = $state({
    left: false,
    right: false,
    bottom: false,
  });

  $effect(() => {
    if (projectManager.unIgnoredSetupSheets.length <= 1) {
      setTimeout(() => {
        tableBody.scroll({
          top: 100,
        });
      }, 100);
    }
  });

  const totalCost = $derived.by(() => {
    let sum = 0;
    for (const tool of projectManager.mergedSetupSheet?.tools.filter(
      (tool) => !tool.hidden,
    ) ?? []) {
      sum += tool.cost ?? 0;
    }
    return Math.floor(sum);
  });

  const totalTime = $derived.by(() => {
    let sum = 0;
    const operationTimes = {
      ROUGH: 0,
      DRILLING: 0,
      FACE_MILLING: 0,
      SEMI_FINISH: 0,
      FINISH: 0,
      _: 0,
    } satisfies Record<keyof typeof OperationEnum, number> & {
      _: number;
    };

    for (const tool of projectManager.mergedSetupSheet?.tools.filter(
      (tool) => !tool.hidden,
    ) ?? []) {
      let time = 0;
      (Object.keys(tool.usage) as Array<keyof typeof tool.usage>).forEach((key) => {
        if (tool.usage[key]) {
          time += tool.usage[key];
          const operationKey = key as keyof typeof operationTimes;
          if (Object.prototype.hasOwnProperty.call(operationTimes, operationKey)) {
            operationTimes[operationKey] += tool.usage[key];
          }
        }
      });
      sum += time;
    }

    operationTimes._ = sum;
    return operationTimes;
  });

  onMount(() => {
    let tableMoveDirection: 'Left' | 'None' | 'Right' = 'None';
    let isCtrlPressed = false;

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Control') {
        isCtrlPressed = true;
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.key === 'Control') {
        isCtrlPressed = false;
      }
    });

    tableBody.addEventListener('mousemove', (event) => {
      const { clientX } = event;
      const { offsetWidth } = tableBody as HTMLElement;
      const scrollThreshold = offsetWidth * 0.1;
      if (clientX < scrollThreshold) {
        tableMoveDirection = 'Left';
      } else if (clientX > offsetWidth - scrollThreshold) {
        tableMoveDirection = 'Right';
      } else {
        tableMoveDirection = 'None';
      }
    });

    function moveTable() {
      if (isCtrlPressed) {
        const { scrollLeft } = tableBody as HTMLElement;
        if (tableMoveDirection === 'Left') {
          tableBody.scrollLeft = Math.min(0, scrollLeft - 3);
        } else if (tableMoveDirection === 'Right') {
          tableBody.scrollLeft = Math.min(
            (tableBody as HTMLElement).scrollWidth,
            scrollLeft + 3,
          );
        }
      }
      requestAnimationFrame(moveTable);
    }
    requestAnimationFrame(moveTable);

    tableBody.addEventListener('scroll', updateTableExtendsOn);
    updateTableExtendsOn();
  });
</script>

<div class="relative grid h-full grid-cols-24 gap-8">
  <div
    class="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-8 gap-3 rounded-b-xl bg-zinc-100 p-3 text-zinc-700"
  >
    <div
      class="flex items-center gap-1.5 border-l-2 border-dashed border-zinc-200 pl-3 text-sm"
    >
      <iconify-icon class="text-base" icon="file-icons:microsoft-project"></iconify-icon>
      <span>{data.project?.name}</span>
    </div>
    <a
      aria-label="home"
      class="flex items-center gap-1.5 text-sm duration-100 hover:scale-110"
      href="/"
    >
      <iconify-icon class="text-base" icon="proicons:home"></iconify-icon>
    </a>
  </div>
  <div class="col-span-6 flex flex-col gap-4 md:col-span-5">
    <div class="flex items-center gap-1.5 text-lg font-bold">
      <iconify-icon class="text-3xl" icon="material-symbols-light:list-alt"
      ></iconify-icon>
      <span>ستاپ شیت ها</span>
      <div class="mr-auto flex gap-2">
        <button
          aria-label="add"
          class=" flex size-5 cursor-pointer items-center justify-center rounded-xl bg-slate-400 text-white duration-100 press-effect hover:bg-slate-600"
          use:tippy={{ content: 'حذف همه ی ستاپ شیت ها' }}
          onclick={() => {
            if (confirm('مطمعنید که میخواهید همه ی ستاپ شیت ها را پاک کنید !؟')) {
              projectManager.deleteAllSetupSheets();
              tableBody.scroll({
                top: 100,
              });
            }
          }}
        >
          <iconify-icon class="text-sm" icon="grommet-icons:clear"></iconify-icon>
        </button>
        <div>
          <label
            class="mr-auto"
            for="upload-setup-sheets"
            use:tippy={{ content: 'افزودن ستاپ شیت (ها)' }}
          >
            <div
              aria-label="add"
              class="flex size-5 cursor-pointer items-center justify-center rounded-xl bg-accent-400 text-white duration-100 press-effect hover:bg-accent-600"
            >
              <iconify-icon class="text-lg" icon="material-symbols-light:add-2-rounded"
              ></iconify-icon>
            </div>
          </label>
          <input
            class="hidden"
            id="upload-setup-sheets"
            type="file"
            oninput={loadSetupSheetsFromFile}
            accept=".html,.html"
            multiple
          />
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2.5" use:autoAnimate>
      {#if loading}
        <div
          class="mt-2 flex content-center items-center justify-center gap-2 px-[15%] text-center text-xs text-zinc-400"
        >
          <iconify-icon class="text-base" icon="svg-spinners:90-ring-with-bg"
          ></iconify-icon>
          <span>در حال بارگذاری</span>
        </div>
      {:else}
        {#each projectManager.setupSheets as setupSheet (setupSheet)}
          <SetupSheetItem
            props={{
              setupSheet: setupSheet,
            }}
          />
        {:else}
          <p class="text-center text-wrap px-[15%] text-zinc-400 mt-2 text-xs">
            با استفاده از گزینه ی بالا میتوانید ستاپ شیت ها را اضافه کنید
          </p>
        {/each}
      {/if}
    </div>
  </div>
  <div class="col-span-18 flex h-full flex-col gap-4 md:col-span-19">
    <div class="flex items-center text-lg">
      <div class="flex gap-1.5 font-bold">
        <iconify-icon class="text-3xl" icon="material-symbols-light:table-view-rounded"
        ></iconify-icon>
        <span>جدول تحلیل داده ها</span>
      </div>
      <div class="mr-auto flex h-full items-stretch gap-3">
        <button
          class="flex items-center gap-1 rounded-xl bg-zinc-100 px-3 py-1 text-xs duration-100 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:!text-zinc-400 disabled:hover:!bg-zinc-200"
          disabled={projectManager.selectedTools.length < 2}
          onclick={async () => {
            const result = await projectManager.groupSelectedTools();
            if (result) {
              await invalidateAll();
              setTimeout(() => {
                confirmToastManager.pop();
              }, 100);
            }
          }}
        >
          <iconify-icon class="text-base" icon="fluent-mdl2:task-group-mirrored"
          ></iconify-icon>
          <span>ساخت گروه</span>
        </button>
        <button
          class="flex items-center gap-1 rounded-xl bg-zinc-100 px-3 py-1 text-xs duration-100 hover:bg-zinc-200"
          onclick={() => {
            projectManager.exportToExcel();
          }}
        >
          <iconify-icon class="text-base" icon="bi:filetype-xlsx"></iconify-icon>
          <span>خروجی اکسل</span>
        </button>
        <div class="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-1 text-xs">
          <iconify-icon class="-ml-1 text-lg" icon="fluent:text-word-count-24-regular"
          ></iconify-icon>
          <span>تعداد :</span>
          <input
            dir="ltr"
            class="eng w-8 bg-transparent px-1 text-center text-xs focus:outline-none"
            type="number"
            bind:value={projectManager.quantity}
            min="1"
            step="1"
            oninput={(event) =>
              projectManager.setQuantity(
                Number((event.target as HTMLInputElement)?.value),
              )}
            onwheel={(event) => {
              event.preventDefault();
              if (event.deltaY < 0) {
                (event.target as HTMLInputElement).stepUp();
              } else {
                (event.target as HTMLInputElement).stepDown();
              }
              projectManager.setQuantity(
                Number((event.target as HTMLInputElement)?.value),
              );
            }}
          />
        </div>
        <div class="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-1 text-xs">
          <iconify-icon class="-ml-1 text-lg" icon="hugeicons:discount"></iconify-icon>
          <span>ضریب کل :</span>
          <input
            dir="ltr"
            class="eng w-8 bg-transparent px-1 text-center text-xs focus:outline-none"
            type="number"
            bind:value={projectManager.scale}
            min="0"
            step="0.1"
            oninput={(event) =>
              projectManager.setScale(Number((event.target as HTMLInputElement)?.value))}
            onwheel={(event) => {
              event.preventDefault();
              if (event.deltaY < 0) {
                (event.target as HTMLInputElement).stepUp();
              } else {
                (event.target as HTMLInputElement).stepDown();
              }
              projectManager.setScale(Number((event.target as HTMLInputElement)?.value));
            }}
          />
        </div>
      </div>
    </div>
    <div class="relative flex grow flex-col overflow-clip rounded-xl">
      {#if tableExtendsOn.left}
        <div
          class="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-black/15 to-transparent"
          transition:fade
        ></div>
      {/if}
      {#if tableExtendsOn.right}
        <div
          class="absolute left-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-black/15 to-transparent"
          transition:fade
        ></div>
      {/if}
      {#if tableExtendsOn.bottom}
        <div
          class="absolute bottom-0 left-0 z-10 h-12 w-full bg-gradient-to-t from-black/15 to-transparent"
          transition:fade
        ></div>
      {/if}

      <div
        class="flex overflow-auto border-b-4 border-dashed bg-zinc-100 px-5 pr-14 text-base font-bold hide-scrollbar"
        bind:this={tableHead}
        onscroll={syncTableBodyHorizontalScroll}
      >
        <button
          class="flex w-40 shrink-0 content-center items-center border-l border-zinc-200/50 px-4 text-right"
          onclick={() => {
            sortBy('name');
          }}
        >
          <span>نام ابزار</span>
          {#if projectManager.sortOptions.column !== 'name'}
            <iconify-icon class="mr-2 text-sm text-zinc-400" icon="icon-park-twotone:sort"
            ></iconify-icon>
          {:else if projectManager.sortOptions.order === 'asc'}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-down-rounded"
            ></iconify-icon>
          {:else}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-up-rounded"
            ></iconify-icon>
          {/if}
        </button>
        <button
          class="flex w-28 shrink-0 content-center items-center border-l border-zinc-200/50 px-4 text-right"
          onclick={() => {
            sortBy('diameter');
          }}
        >
          <span>قطر</span>
          {#if projectManager.sortOptions.column !== 'diameter'}
            <iconify-icon class="mr-2 text-sm text-zinc-400" icon="icon-park-twotone:sort"
            ></iconify-icon>
          {:else if projectManager.sortOptions.order === 'asc'}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-down-rounded"
            ></iconify-icon>
          {:else}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-up-rounded"
            ></iconify-icon>
          {/if}
        </button>
        <div class="flex flex-col">
          <div class="border-b border-l border-zinc-200/50 p-4">عمر ابزار</div>
          <div class="flex">
            <button
              class="flex w-32 shrink-0 content-center items-center border-l border-zinc-200/50 p-4 text-right"
              onclick={() => {
                sortBy('usage.rough');
              }}
            >
              <span class="eng">Rough</span>

              {#if projectManager.sortOptions.column !== 'usage.rough'}
                <iconify-icon
                  class="mr-2 text-sm text-zinc-400"
                  icon="icon-park-twotone:sort"
                ></iconify-icon>
              {:else if projectManager.sortOptions.order === 'asc'}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-down-rounded"
                ></iconify-icon>
              {:else}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-up-rounded"
                ></iconify-icon>
              {/if}
            </button>
            <button
              class="flex w-32 shrink-0 content-center items-center border-l border-zinc-200/50 p-4 text-right"
              onclick={() => {
                sortBy('usage.drilling');
              }}
            >
              <span class="eng">Drilling</span>

              {#if projectManager.sortOptions.column !== 'usage.drilling'}
                <iconify-icon
                  class="mr-2 text-sm text-zinc-400"
                  icon="icon-park-twotone:sort"
                ></iconify-icon>
              {:else if projectManager.sortOptions.order === 'asc'}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-down-rounded"
                ></iconify-icon>
              {:else}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-up-rounded"
                ></iconify-icon>
              {/if}
            </button>
            <button
              class="flex w-40 shrink-0 content-center items-center border-l border-zinc-200/50 p-4 text-right"
              onclick={() => {
                sortBy('usage.face_milling');
              }}
            >
              <span class="eng">Face Milling</span>

              {#if projectManager.sortOptions.column !== 'usage.face_milling'}
                <iconify-icon
                  class="mr-2 text-sm text-zinc-400"
                  icon="icon-park-twotone:sort"
                ></iconify-icon>
              {:else if projectManager.sortOptions.order === 'asc'}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-down-rounded"
                ></iconify-icon>
              {:else}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-up-rounded"
                ></iconify-icon>
              {/if}
            </button>
            <button
              class="flex w-40 shrink-0 content-center items-center border-l border-zinc-200/50 p-4 text-right"
              onclick={() => {
                sortBy('usage.semi-finish');
              }}
            >
              <span class="eng">Semi-Finish</span>

              {#if projectManager.sortOptions.column !== 'usage.semi-finish'}
                <iconify-icon
                  class="mr-2 text-sm text-zinc-400"
                  icon="icon-park-twotone:sort"
                ></iconify-icon>
              {:else if projectManager.sortOptions.order === 'asc'}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-down-rounded"
                ></iconify-icon>
              {:else}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-up-rounded"
                ></iconify-icon>
              {/if}
            </button>
            <button
              class="flex w-36 shrink-0 content-center items-center border-l border-zinc-200/50 p-4 text-right"
              onclick={() => {
                sortBy('usage.finish');
              }}
            >
              <span class="eng">Finish</span>

              {#if projectManager.sortOptions.column !== 'usage.finish'}
                <iconify-icon
                  class="mr-2 text-sm text-zinc-400"
                  icon="icon-park-twotone:sort"
                ></iconify-icon>
              {:else if projectManager.sortOptions.order === 'asc'}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-down-rounded"
                ></iconify-icon>
              {:else}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-up-rounded"
                ></iconify-icon>
              {/if}
            </button>
            <button
              class="flex w-36 shrink-0 content-center items-center border-l border-zinc-200/50 p-4 text-right"
              onclick={() => {
                sortBy('usage.total');
              }}
            >
              <span class="eng">Total</span>

              {#if projectManager.sortOptions.column !== 'usage.total'}
                <iconify-icon
                  class="mr-2 text-sm text-zinc-400"
                  icon="icon-park-twotone:sort"
                ></iconify-icon>
              {:else if projectManager.sortOptions.order === 'asc'}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-down-rounded"
                ></iconify-icon>
              {:else}
                <iconify-icon
                  class="text-3xl"
                  icon="material-symbols-light:arrow-drop-up-rounded"
                ></iconify-icon>
              {/if}
            </button>
          </div>
        </div>
        <button
          class="flex w-28 shrink-0 content-center items-center border-l border-zinc-200/50 px-4 text-right"
          onclick={() => {
            sortBy('need');
          }}
        >
          <span>نیاز</span>

          {#if projectManager.sortOptions.column !== 'need'}
            <iconify-icon class="mr-2 text-sm text-zinc-400" icon="icon-park-twotone:sort"
            ></iconify-icon>
          {:else if projectManager.sortOptions.order === 'asc'}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-down-rounded"
            ></iconify-icon>
          {:else}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-up-rounded"
            ></iconify-icon>
          {/if}
        </button>
        <button
          class="flex w-32 shrink-0 content-center items-center border-l border-zinc-200/50 px-4 text-right"
          onclick={() => {
            sortBy('relationalDurability');
          }}
        >
          <span>عمر نسبی</span>

          {#if projectManager.sortOptions.column !== 'relationalDurability'}
            <iconify-icon class="mr-2 text-sm text-zinc-400" icon="icon-park-twotone:sort"
            ></iconify-icon>
          {:else if projectManager.sortOptions.order === 'asc'}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-down-rounded"
            ></iconify-icon>
          {:else}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-up-rounded"
            ></iconify-icon>
          {/if}
        </button>
        <button
          class="min-w-36 shrink-0 grow content-center px-4 text-right"
          onclick={() => {
            sortBy('cost');
          }}
        >
          <span>هزینه</span>

          {#if projectManager.sortOptions.column !== 'cost'}
            <iconify-icon class="mr-2 text-sm text-zinc-400" icon="icon-park-twotone:sort"
            ></iconify-icon>
          {:else if projectManager.sortOptions.order === 'asc'}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-down-rounded"
            ></iconify-icon>
          {:else}
            <iconify-icon
              class="text-3xl"
              icon="material-symbols-light:arrow-drop-up-rounded"
            ></iconify-icon>
          {/if}
        </button>
      </div>
      <div
        class="relative flex grow basis-0 flex-col overflow-auto bg-gray-100"
        bind:this={tableBody}
        onscroll={syncTableHeadHorizontalScroll}
      >
        {#if projectManager.mergedSetupSheet}
          {#each projectManager.mergedSetupSheet.tools as record (record)}
            <RecordItem
              props={{
                record,
              }}
            />
          {/each}
        {:else}
          <div
            class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400"
          >
            <div class="flex flex-col items-center gap-2">
              <iconify-icon
                class="text-3xl"
                icon="material-symbols-light:live-help-outline"
              ></iconify-icon>
              <span> از منوی سمت راست ستاپ شیت هارا جهت تحلیل اضافه کنید</span>
            </div>
            <label
              class="block cursor-pointer rounded-full bg-accent-100 px-2 py-1 text-xs text-accent-500 duration-100 hover:bg-accent-200"
              for="upload-setup-sheets">یا اینجا کلیک کنید</label
            >
          </div>
        {/if}
      </div>
    </div>
    <div class="group top-full z-20 flex w-full flex-col items-center justify-center">
      <div
        class="mb-2 flex w-fit items-center justify-center gap-3 rounded-xl bg-zinc-100 px-5 py-3 text-sm"
      >
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="font-bold">هزینه کل ابزار :</span>
          <span class="eng">{Helper.Currency.formatCurrency(totalCost)} تومان</span>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="font-bold">زمان کل عملیات Rough :</span>
          <span class="eng">{Helper.Time.convertSecondsToHHMMSS(totalTime.ROUGH)} </span>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="font-bold">Drilling :</span>
          <span class="eng"
            >{Helper.Time.convertSecondsToHHMMSS(totalTime.DRILLING)}
          </span>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="font-bold">Face Milling :</span>
          <span class="eng"
            >{Helper.Time.convertSecondsToHHMMSS(totalTime.FACE_MILLING)}
          </span>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="font-bold">Semi-Finish :</span>
          <span class="eng"
            >{Helper.Time.convertSecondsToHHMMSS(totalTime.SEMI_FINISH)}
          </span>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="font-bold">Finish :</span>
          <span class="eng">{Helper.Time.convertSecondsToHHMMSS(totalTime.FINISH)} </span>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span class="font-bold">همه :</span>
          <span class="eng">{Helper.Time.convertSecondsToHHMMSS(totalTime._)} </span>
        </div>
      </div>
    </div>
  </div>
</div>
