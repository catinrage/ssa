<script lang="ts">
  type Props = {
    checked?: boolean;
  };

  let { checked = $bindable(false) }: Props = $props();
</script>

<div class="inline-flex items-center">
  <label class="relative flex cursor-pointer items-center">
    <input
      type="checkbox"
      class="peer h-5 w-5 cursor-pointer appearance-none rounded-md bg-slate-200 transition-all duration-100 checked:border-slate-600 checked:!bg-slate-600 hover:bg-slate-300"
      bind:checked
      onclick={(event) => {
        event.stopPropagation();
      }}
    />
    <span
      class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-white opacity-0 peer-checked:opacity-100"
    >
      {#if checked}
        <svg
          class="relative right-[1px] scale-105"
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          ><path
            fill="none"
            stroke="currentColor"
            stroke-dasharray="24"
            stroke-dashoffset="24"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3.5"
            d="M5 11l6 6l10 -10"
            ><animate
              fill="freeze"
              attributeName="stroke-dashoffset"
              dur="0.3s"
              values="24;0"
            /></path
          ></svg
        >
      {/if}
    </span>
  </label>
</div>
