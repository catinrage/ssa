/**
 * `onOutClick` is a custom Svelte action that triggers a callback when a mouse up event
 * occurs outside of the associated component. This is useful for scenarios such as closing
 * a dropdown menu or modal when the user clicks anywhere else on the page.
 */
export function onOutClick(node: HTMLElement, callback: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (event.button === 1) return;
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      setTimeout(() => {
        callback();
      }, 0);
    }
  };

  document.addEventListener('mousedown', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('mousedown', handleClick, true);
    },
  };
}

/**
 * `onInView` triggers a callback when the element becomes visible in the viewport
 */
export function onInView(node: HTMLElement, callback: () => void) {
  const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && callback(), {
    threshold: 0,
  });

  observer.observe(node);
  return {
    destroy(): void {
      observer.unobserve(node);
    },
  };
}

/**
 * `onLongPress` triggers a callback after a sustained touch/click of duration
 */
export function onLongPress(node: HTMLElement, callback: () => void, duration = 500) {
  let timer: ReturnType<typeof setTimeout>;

  function startPress(e: MouseEvent | TouchEvent) {
    if (e.type === 'click' && e instanceof MouseEvent && e.button !== 0) return;

    timer = setTimeout(callback, duration);
  }

  function cancelPress() {
    clearTimeout(timer);
  }

  node.addEventListener('mousedown', startPress);
  node.addEventListener('touchstart', startPress);

  node.addEventListener('mouseup', cancelPress);
  node.addEventListener('mouseleave', cancelPress);
  node.addEventListener('touchend', cancelPress);

  return {
    destroy(): void {
      node.removeEventListener('mousedown', startPress);
      node.removeEventListener('touchstart', startPress);

      node.removeEventListener('mouseup', cancelPress);
      node.removeEventListener('mouseleave', cancelPress);
      node.removeEventListener('touchend', cancelPress);
    },
  };
}

/**
 * `onLeftClick` triggers a callback when the user clicks with the left mouse button
 */
export function onLeftClick(node: HTMLElement, callback: () => void) {
  function handleClick(event: MouseEvent) {
    if (event.button === 0) {
      callback();
    }
  }

  node.addEventListener('click', handleClick);

  return {
    destroy() {
      node.removeEventListener('click', handleClick);
    },
  };
}

/**
 * `onRightClick` triggers a callback when the user clicks with the right mouse button
 */
export function onRightClick(node: HTMLElement, callback: () => void) {
  function handleClick(event: MouseEvent) {
    if (event.button === 2) {
      callback();
    }
  }

  node.addEventListener('click', handleClick);

  return {
    destroy() {
      node.removeEventListener('click', handleClick);
    },
  };
}

/**
 * `onMiddleClick` triggers a callback when the user clicks with the middle mouse button
 */
export function onMiddleClick(node: HTMLElement, callback: () => void) {
  function handleClick(event: MouseEvent) {
    if (event.button === 1) {
      callback();
    }
  }

  node.addEventListener('click', handleClick);

  return {
    destroy() {
      node.removeEventListener('click', handleClick);
    },
  };
}

/**
 * `onEnter` triggers a callback when the user presses the Enter key
 */
export function onEnter(node: HTMLElement, callback: () => void) {
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      callback();
    }
  }

  node.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
    },
  };
}

/**
 * `onEsc` triggers a callback when the user presses the Escape key
 */
export function onEsc(node: HTMLElement, callback: () => void) {
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      callback();
    }
  }

  node.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown);
    },
  };
}
