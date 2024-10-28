/**
 * Traps focus within a given element.
 * For example, lets say you have a modal that is a form, and you want to trap focus within the modal
 */
export function trapFocus(node: HTMLElement) {
  const previous = document.activeElement as HTMLElement | null;

  function focusable() {
    return Array.from(
      node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
    ) as HTMLElement[];
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const current = document.activeElement;

    const elements = focusable();
    const first = elements.at(0) as HTMLElement;
    const last = elements.at(-1) as HTMLElement;

    if (event.shiftKey && current === first) {
      last.focus();
      event.preventDefault();
    }

    if (!event.shiftKey && current === last) {
      first.focus();
      event.preventDefault();
    }
  }

  focusable()[0]?.focus();

  node.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
      previous?.focus();
    },
  };
}
