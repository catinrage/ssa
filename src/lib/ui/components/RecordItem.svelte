<script lang="ts">
  import { Helper } from '$lib/helpers';
  import {
    ModelSetupSheetToolGroup,
    type ModelSetupSheetTool,
  } from '$lib/models/tool.svelte';
  import { getProjectManager } from '$lib/managers/projectManager.svelte';
  import SoloCheckBox from '$ui/components/SoloCheckBox.svelte';
  import Overlay from '$ui/Overlay.svelte';
  import type { Prisma } from '@prisma/client';
  import { onMount, untrack } from 'svelte';
  import tippy from 'svelte-tippy';
  import { onOutClick } from '$lib/actions/customEvents';
  import { superForm } from 'sveltekit-superforms/client';
  import { registerToolSchema } from '$lib/schemas/tool/register';
  import { defaults } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import PriceInput from './inputs/PriceInput.svelte';
  import NumberInput from './inputs/NumberInput.svelte';
  import { updateGroupSchema } from '$lib/schemas/group/update';
  import { invalidateAll } from '$app/navigation';
  import { getConfirmToastManager } from '$lib/managers/confirmToastManager.svelte';

  type Props = {
    record: ModelSetupSheetTool;
  };

  let { props }: { props: Props } = $props();

  const projectManager = getProjectManager();
  const confirmToastManager = getConfirmToastManager();

  const isGroup = props.record instanceof ModelSetupSheetToolGroup;
  let isSelected = $state(false);

  const setupSheetManager = getProjectManager();
  let registered = $state(isGroup);

  let registeringTool = $state(false);
  let updatingGroup = $state(false);

  const totalUsage = $derived.by(() => {
    return Object.values(props.record.usage).reduce((total, usage) => total + usage, 0);
  });

  async function getToolData(name: string) {
    return (await fetch(`/api/tool/${name}`).then((res) =>
      res.json(),
    )) as Prisma.ToolGetPayload<{
      include: { durability: true };
    }> | null;
  }

  async function getGroupData(id: string) {
    return (await fetch(`/api/group/${id}`).then((res) =>
      res.json(),
    )) as Prisma.GroupGetPayload<{
      include: { durability: true };
    }> | null;
  }

  async function propagateToolData(name: string) {
    const tool = await getToolData(name);
    if (tool) {
      setupSheetManager.updateToolData(name, {
        price: tool.price,
        durability: {
          DRILLING: tool.durability!.drilling,
          FACE_MILLING: tool.durability!.faceMilling,
          FINISH: tool.durability!.finish,
          ROUGH: tool.durability!.rough,
          SEMI_FINISH: tool.durability!.semiFinish,
        },
      });
      $registerToolForm.price = tool.price;
      $registerToolForm.durability = tool.durability!;
      setTimeout(() => {
        isRegisterFormTainted = false;
      });
      registered = true;
    }
  }

  async function fetchGroupData() {
    const data = await getGroupData(props.record.id);
    props.record.durability = {
      ROUGH: data?.durability?.rough ?? 0,
      DRILLING: data?.durability?.drilling ?? 0,
      FACE_MILLING: data?.durability?.faceMilling ?? 0,
      SEMI_FINISH: data?.durability?.semiFinish ?? 0,
      FINISH: data?.durability?.finish ?? 0,
    };
    props.record.price = data!.price;
    if (data) {
      $updateGroupForm.price = data.price;
      $updateGroupForm.durability = data.durability!;
      $updateGroupForm.id = data.id;
      setTimeout(() => {
        isUpdateGroupFormTainted = false;
      });
    }
  }

  function openRegisterWindow() {
    if (isGroup) {
      updatingGroup = true;
    } else {
      registeringTool = true;
    }
  }

  function closeRegisterWindow() {
    if (isGroup) {
      if (isUpdateGroupFormTainted) {
        if (confirm('آیا مطمئنید که می‌خواهید از این صفحه خارج شوید؟')) {
          updatingGroup = false;
        }
      } else {
        updatingGroup = false;
      }
    } else {
      if (isRegisterFormTainted) {
        if (confirm('آیا مطمئنید که می‌خواهید از این صفحه خارج شوید؟')) {
          registeringTool = false;
        }
      } else {
        registeringTool = false;
      }
    }
  }

  async function deleteGroup() {
    if (isGroup) {
      const confirmation = confirm('آیا از حذف این گروه اطمینان دارید؟');
      if (!confirmation) return;
      const response = await fetch(`/api/group/${props.record.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        updatingGroup = false;
        projectManager.groups = projectManager.groups.filter(
          (group) => group.id !== props.record.id,
        );
        await invalidateAll();
        setTimeout(() => {
          confirmToastManager.pop();
        }, 100);
      }
    }
  }

  onMount(async () => {
    await propagateToolData(props.record.name);
  });

  if (isGroup) {
    fetchGroupData();
  }

  const {
    form: updateGroupForm,
    enhance: updateGroupFormEnhance,
    errors: updateGroupFormErrors,
    tainted: updateGroupFormTainted,
  } = superForm(defaults(zod(updateGroupSchema)), {
    dataType: 'json',
    validators: zod(updateGroupSchema),
    async onUpdate({ result }) {
      if (result.type === 'success') {
        await fetchGroupData();
        updatingGroup = false;
        setTimeout(() => {
          confirmToastManager.pop();
        }, 100);
      }
    },
    warnings: {
      duplicateId: false,
    },
  });

  let isUpdateGroupFormTainted = $state(false);

  const {
    form: registerToolForm,
    enhance: registerToolFormEnhance,
    errors: registerToolFormErrors,
    tainted: registerToolFormTainted,
  } = superForm(defaults(zod(registerToolSchema)), {
    dataType: 'json',
    validators: zod(registerToolSchema),
    async onUpdate({ result }) {
      if (result.type === 'success') {
        await propagateToolData(props.record.name);
        registeringTool = false;
        setTimeout(() => {
          confirmToastManager.pop();
        }, 100);
      }
    },
    warnings: {
      duplicateId: false,
    },
  });

  let isRegisterFormTainted = $state(false);

  $effect(() => {
    if ($updateGroupFormTainted?.price) isUpdateGroupFormTainted = true;
    if (
      $updateGroupFormTainted?.durability?.rough ||
      $updateGroupFormTainted?.durability?.drilling ||
      $updateGroupFormTainted?.durability?.faceMilling ||
      $updateGroupFormTainted?.durability?.semiFinish ||
      $updateGroupFormTainted?.durability?.finish
    ) {
      isUpdateGroupFormTainted = true;
    }
  });

  $effect(() => {
    if ($registerToolFormTainted?.price) isRegisterFormTainted = true;
    if (
      $registerToolFormTainted?.durability?.rough ||
      $registerToolFormTainted?.durability?.drilling ||
      $registerToolFormTainted?.durability?.faceMilling ||
      $registerToolFormTainted?.durability?.semiFinish ||
      $registerToolFormTainted?.durability?.finish
    ) {
      isRegisterFormTainted = true;
    }
  });

  $effect(() => {
    if (registeringTool) {
      $registerToolForm.name = props.record.name;
      $registerToolForm.diameter = props.record.diameter;
    }
  });

  $effect(() => {
    if (isSelected) {
      untrack(() => {
        projectManager.selectedTools.push(props.record);
      });
    } else {
      untrack(() => {
        projectManager.selectedTools = projectManager.selectedTools.filter(
          (tool) => tool.name !== props.record.name,
        );
      });
    }
  });
</script>

<button
  class="flex h-20 min-w-max shrink-0 items-center bg-zinc-50 text-right text-sm hover:bg-zinc-100"
  onclick={async () => {
    await propagateToolData(props.record.name);
    openRegisterWindow();
  }}
  onmouseenter={() => {
    if (isGroup) {
      (props.record as ModelSetupSheetToolGroup).tools.forEach((tool) => {
        tool.sources.forEach((source) => {
          projectManager.highlightSetupSheet(source.id);
        });
      });
    } else {
      props.record.sources.forEach((source) => {
        projectManager.highlightSetupSheet(source.id);
      });
    }
  }}
  onmouseleave={() => {
    projectManager.unHighlightAllSetupSheets();
  }}
>
  <div
    class="eng flex h-full w-14 shrink-0 flex-col items-center justify-center border-b border-l border-zinc-200/50"
  >
    {#if isGroup}
      <iconify-icon
        class="text-lg text-zinc-500"
        icon="fluent-mdl2:task-group-mirrored"
        use:tippy={{
          content: (props.record as ModelSetupSheetToolGroup).tools
            .map((tool) => tool.name)
            .join(', '),
        }}
      ></iconify-icon>
    {:else}
      <SoloCheckBox bind:checked={isSelected} />
    {/if}
  </div>
  <div
    class="eng flex h-full w-40 shrink-0 flex-col justify-center border-b border-l border-zinc-200/50 px-4"
  >
    <span
      dir="ltr"
      class="line-clamp-1 break-all"
      use:tippy={{ content: props.record.name }}>{props.record.name}</span
    >
    {#if registered}
      <span class="text-xs text-accent-500"
        >{Helper.Currency.formatCurrency(props.record.price ?? 0)} تومان</span
      >
    {:else}
      <span class="text-xs text-rose-500">ثبت نشده</span>
    {/if}
  </div>
  <div
    dir="ltr"
    class="eng h-full w-28 shrink-0 content-center justify-center border-b border-l border-zinc-200/50 px-4 text-right"
  >
    {props.record.diameter} <span class="text-gray-400">mm</span>
  </div>
  <div
    class="eng flex h-full w-32 shrink-0 flex-col justify-center border-b border-l border-zinc-200/50 px-4"
    class:bg-rose-50={props.record.usage.ROUGH && !props.record.durability.ROUGH}
    class:bg-accent-50={props.record.usage.ROUGH && props.record.durability.ROUGH}
  >
    <span class:opacity-40={!props.record.usage.ROUGH}
      >{Helper.Time.convertSecondsToHHMMSS(props.record.usage.ROUGH)}</span
    >
    <span class="text-accent-500" class:opacity-40={!props.record.usage.ROUGH}
      >{Helper.Time.convertSecondsToHHMMSS(props.record.durability.ROUGH * 60)}</span
    >
  </div>
  <div
    class="eng flex h-full w-32 shrink-0 flex-col justify-center border-b border-l border-zinc-200/50 px-4"
    class:bg-rose-50={props.record.usage.DRILLING && !props.record.durability.DRILLING}
    class:bg-accent-50={props.record.usage.DRILLING && props.record.durability.DRILLING}
  >
    <span class:opacity-40={!props.record.usage.DRILLING}
      >{Helper.Time.convertSecondsToHHMMSS(props.record.usage.DRILLING)}</span
    >
    <span class="text-accent-500" class:opacity-40={!props.record.usage.DRILLING}
      >{Helper.Time.convertSecondsToHHMMSS(props.record.durability.DRILLING * 60)}</span
    >
  </div>
  <div
    class="eng flex h-full w-40 shrink-0 flex-col justify-center border-b border-l border-zinc-200/50 px-4"
    class:bg-rose-50={props.record.usage.FACE_MILLING &&
      !props.record.durability.FACE_MILLING}
    class:bg-accent-50={props.record.usage.FACE_MILLING &&
      props.record.durability.FACE_MILLING}
  >
    <span class:opacity-40={!props.record.usage.FACE_MILLING}
      >{Helper.Time.convertSecondsToHHMMSS(props.record.usage.FACE_MILLING)}</span
    >
    <span class="text-accent-500" class:opacity-40={!props.record.usage.FACE_MILLING}
      >{Helper.Time.convertSecondsToHHMMSS(
        props.record.durability.FACE_MILLING * 60,
      )}</span
    >
  </div>
  <div
    class="eng flex h-full w-40 shrink-0 flex-col justify-center border-b border-l border-zinc-200/50 px-4"
    class:bg-rose-50={props.record.usage.SEMI_FINISH &&
      !props.record.durability.SEMI_FINISH}
    class:bg-accent-50={props.record.usage.SEMI_FINISH &&
      props.record.durability.SEMI_FINISH}
  >
    <span class:opacity-40={!props.record.usage.SEMI_FINISH}
      >{Helper.Time.convertSecondsToHHMMSS(props.record.usage.SEMI_FINISH)}</span
    >
    <span class="text-accent-500" class:opacity-40={!props.record.usage.SEMI_FINISH}
      >{Helper.Time.convertSecondsToHHMMSS(
        props.record.durability.SEMI_FINISH * 60,
      )}</span
    >
  </div>
  <div
    class="eng flex h-full w-36 shrink-0 flex-col justify-center border-b border-l border-zinc-200/50 px-4"
    class:bg-rose-50={props.record.usage.FINISH && !props.record.durability.FINISH}
    class:bg-accent-50={props.record.usage.FINISH && props.record.durability.FINISH}
  >
    <span class:opacity-40={!props.record.usage.FINISH}
      >{Helper.Time.convertSecondsToHHMMSS(props.record.usage.FINISH)}</span
    >
    <span class="text-accent-500" class:opacity-40={!props.record.usage.FINISH}
      >{Helper.Time.convertSecondsToHHMMSS(props.record.durability.FINISH * 60)}</span
    >
  </div>
  <div
    class="eng flex h-full w-36 shrink-0 flex-col justify-center border-b border-l border-zinc-200/50 px-4"
  >
    <span>{Helper.Time.convertSecondsToHHMMSS(totalUsage)}</span>
  </div>
  <div
    dir="rtl"
    class="eng h-full w-28 shrink-0 content-center justify-center border-b border-l border-zinc-200/50 px-4 text-right"
  >
    {props.record.need ?? 'ت.ن'} <span class="text-xs text-gray-400">عدد</span>
  </div>
  <div
    dir="rtl"
    class="eng h-full w-32 shrink-0 content-center justify-center border-b border-l border-zinc-200/50 px-4 text-right"
  >
    {props.record.relationalDurability ?? 'ت.ن'}
    <span class="text-xs text-gray-400">عملیات</span>
  </div>
  <div
    dir="rtl"
    class="eng h-full min-w-36 shrink-0 grow content-center justify-center border-b border-zinc-200/50 px-4 text-right"
  >
    {Helper.Currency.formatCurrency(props.record.cost ?? 0) || 'ت.ن'}
    <span class="text-xs text-gray-400">تومان</span>
  </div>
</button>

{#if registeringTool}
  <Overlay>
    <div
      class="flex w-1/2 flex-col rounded-xl bg-white p-6 text-sm shadow-sm"
      use:onOutClick={closeRegisterWindow}
    >
      <h2 class="mb-4 flex items-center gap-1.5 text-base">
        <iconify-icon
          class="text-2xl"
          icon="material-symbols-light:lab-profile-outline-rounded"
        ></iconify-icon>
        <div>
          {registered ? 'ویرایش' : 'ثبت'} اطلاعات برای ابزار :
          <span class="eng font-bold">{props.record.name}</span>
        </div>
      </h2>
      <form
        class="contents"
        method="post"
        action="?/registerTool"
        use:registerToolFormEnhance
      >
        <h3 class="mb-3 font-semibold">عمر ابزار در عملیات :</h3>
        <div class="grid grid-cols-5 gap-4">
          <NumberInput
            label="Rough"
            error={!!$registerToolFormErrors.durability?.rough?.length}
            bind:value={$registerToolForm.durability.rough}
          />
          <NumberInput
            label="Drilling"
            error={!!$registerToolFormErrors.durability?.drilling?.length}
            bind:value={$registerToolForm.durability.drilling}
          />
          <NumberInput
            label="Face Milling"
            error={!!$registerToolFormErrors.durability?.faceMilling?.length}
            bind:value={$registerToolForm.durability.faceMilling}
          />
          <NumberInput
            label="Semi-Finish"
            error={!!$registerToolFormErrors.durability?.semiFinish?.length}
            bind:value={$registerToolForm.durability.semiFinish}
          />
          <NumberInput
            label="Finish"
            error={!!$registerToolFormErrors.durability?.finish?.length}
            bind:value={$registerToolForm.durability.finish}
          />
          <PriceInput
            error={!!$registerToolFormErrors.price?.length}
            bind:value={$registerToolForm.price}
          />
        </div>

        <div class="mt-4 flex gap-3">
          <button
            class="rounded-xl bg-accent-500 px-4 py-2 text-sm text-white duration-100 animate-infinite hover:bg-accent-700 disabled:cursor-not-allowed disabled:!bg-accent-300 disabled:hover:!bg-accent-300"
            class:animate-wiggle={isRegisterFormTainted}
            type="submit"
            disabled={!isRegisterFormTainted}>{registered ? 'ویرایش' : 'ثبت'}</button
          >
          <button
            class="rounded-xl bg-zinc-500 px-4 py-2 text-sm text-white duration-100 hover:bg-zinc-700"
            onclick={closeRegisterWindow}>لغو</button
          >
        </div>
      </form>
    </div>
  </Overlay>
{/if}

{#if updatingGroup}
  <Overlay>
    <div
      class="flex w-1/2 flex-col rounded-xl bg-white p-6 text-sm shadow-sm"
      use:onOutClick={closeRegisterWindow}
    >
      <h2 class="mb-4 flex items-center gap-1.5 text-base">
        <iconify-icon
          class="text-2xl"
          icon="material-symbols-light:lab-profile-outline-rounded"
        ></iconify-icon>
        <div>
          ویرایش اطلاعات برای گروه :
          <span class="eng font-bold">{props.record.name}</span>
        </div>
      </h2>
      <form
        class="contents"
        method="post"
        action="?/updateGroup"
        use:updateGroupFormEnhance
      >
        <h3 class="mb-3 font-semibold">عمر گروه در عملیات :</h3>
        <div class="grid grid-cols-5 gap-4">
          <NumberInput
            label="Rough"
            error={!!$updateGroupFormErrors.durability?.rough?.length}
            bind:value={$updateGroupForm!.durability!.rough}
          />
          <NumberInput
            label="Drilling"
            error={!!$updateGroupFormErrors.durability?.drilling?.length}
            bind:value={$updateGroupForm!.durability!.drilling}
          />
          <NumberInput
            label="Face Milling"
            error={!!$updateGroupFormErrors.durability?.faceMilling?.length}
            bind:value={$updateGroupForm!.durability!.faceMilling}
          />
          <NumberInput
            label="Semi-Finish"
            error={!!$updateGroupFormErrors.durability?.semiFinish?.length}
            bind:value={$updateGroupForm!.durability!.semiFinish}
          />
          <NumberInput
            label="Finish"
            error={!!$updateGroupFormErrors.durability?.finish?.length}
            bind:value={$updateGroupForm!.durability!.finish}
          />
          <PriceInput
            error={!!$updateGroupFormErrors.price?.length}
            bind:value={$updateGroupForm!.price!}
          />
        </div>

        <div class="mt-4 flex gap-3">
          <button
            class="rounded-xl bg-accent-500 px-4 py-2 text-sm text-white duration-100 animate-infinite hover:bg-accent-700 disabled:cursor-not-allowed disabled:!bg-accent-300 disabled:hover:!bg-accent-300"
            class:animate-wiggle={isUpdateGroupFormTainted}
            type="submit"
            disabled={!isUpdateGroupFormTainted}>ویرایش</button
          >
          <button
            class="rounded-xl bg-rose-500 px-4 py-2 text-sm text-white duration-100 animate-infinite hover:bg-rose-700 disabled:cursor-not-allowed disabled:!bg-rose-300 disabled:hover:!bg-accent-300"
            type="button"
            onclick={async () => {
              await deleteGroup();
            }}>حذف گروه و نمایش مجدد ابزار</button
          >
          <button
            class="rounded-xl bg-zinc-500 px-4 py-2 text-sm text-white duration-100 hover:bg-zinc-700"
            onclick={closeRegisterWindow}>لغو</button
          >
        </div>
      </form>
    </div>
  </Overlay>
{/if}
