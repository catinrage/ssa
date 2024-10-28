<script lang="ts">
  type Props = {
    label: string;
    value: number;
    error?: boolean;
  };

  let { label, value = $bindable(0), error = false }: Props = $props();

  function handleWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        (event.target as HTMLInputElement).stepUp(30);
      } else {
        (event.target as HTMLInputElement).stepDown(30);
      }
    } else if (event.shiftKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        (event.target as HTMLInputElement).stepUp(10);
      } else {
        (event.target as HTMLInputElement).stepDown(10);
      }
    }
    (event.target as HTMLInputElement).dispatchEvent(
      new Event('input', { bubbles: true }),
    );
  }
</script>

<div class="flex flex-col gap-2 text-xs">
  <div class="flex gap-1">
    <span>{label}</span>
    <span class="text-us text-zinc-400">(دقیقه)</span>
  </div>
  <input
    class="rounded-xl border bg-zinc-100 px-3 py-1.5 duration-300 animate-once"
    class:border-red-400={error}
    class:animate-pulse={error}
    type="number"
    min="0"
    bind:value
    onwheel={handleWheel}
  />
</div>
