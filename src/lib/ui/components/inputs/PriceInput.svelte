<script lang="ts">
  import { onMount } from 'svelte';

  type Props = {
    value: number;
    error?: boolean;
  };

  let { value = $bindable(0), error = false }: Props = $props();
  let displayValue = $state('');

  // Format the value for display
  function formatValue(val: number) {
    return new Intl.NumberFormat('en-US').format(val);
  }

  // Update the display value whenever the bound value changes
  $effect(() => {
    displayValue = formatValue(value);
  });

  // Parse the input value back to a number
  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const numericValue = parseInt(input.value.replace(/,/g, ''), 10);
    value = isNaN(numericValue) ? 0 : numericValue;
  }

  function handleWheel(event: WheelEvent) {
    const minValue = 0; // Define the minimum value

    if (event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        value += 100000;
      } else {
        value -= 100000;
      }
    } else if (event.shiftKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        value += 50000;
      } else {
        value -= 50000;
      }
    }

    // Ensure the value does not go below the minimum value
    if (value < minValue) {
      value = minValue;
    }

    displayValue = formatValue(value);
  }

  onMount(() => {
    displayValue = formatValue(value);
  });
</script>

<div class="flex flex-col gap-2 text-xs">
  <div class="flex gap-1">
    <span>قیمت</span>
    <span class="text-us text-zinc-400">(تومان)</span>
  </div>
  <input
    class="rounded-xl border bg-zinc-100 px-3 py-1.5 duration-300"
    class:border-red-400={error}
    type="text"
    bind:value={displayValue}
    oninput={handleInput}
    onwheel={handleWheel}
  />
</div>
