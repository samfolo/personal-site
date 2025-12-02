/**
 * Sheen Text Animation Controller
 *
 * Animates a left-to-right colour sweep on hover for elements
 * with the [data-sheen-text] attribute.
 */

interface SheenState {
  chars: HTMLSpanElement[];
  interval: number;
  animationId: number | null;
  frame: number;
}

const SHEEN_SELECTOR = '[data-sheen-text]';
const CHAR_CLASS = 'sheen-char';

// Track state for each sheen element
const sheenStates = new WeakMap<HTMLElement, SheenState>();

/**
 * Split text into individual character spans
 */
function splitIntoChars(element: HTMLElement, text: string): HTMLSpanElement[] {
  const chars: HTMLSpanElement[] = [];
  element.innerHTML = '';

  for (const char of text) {
    const span = document.createElement('span');
    span.className = CHAR_CLASS;

    if (char === ' ') {
      span.innerHTML = '&nbsp;';
    } else {
      span.textContent = char;
    }

    element.appendChild(span);
    chars.push(span);
  }

  return chars;
}

/**
 * Reset all characters to default styles
 */
function resetStyles(chars: HTMLSpanElement[]): void {
  for (const char of chars) {
    char.style.color = '';
    char.style.fontFamily = '';
  }
}

/**
 * Apply sheen colours at the current frame position
 * 5-character gradient: centre 100%, ±1 50%, ±2 30%
 */
function applyFrame(chars: HTMLSpanElement[], frame: number): void {
  for (let i = 0; i < chars.length; i++) {
    const distance = Math.abs(i - frame);

    if (distance === 0) {
      // Centre character: full highlight
      chars[i].style.color = 'var(--highlight)';
    } else if (distance === 1) {
      chars[i].style.color = 'color-mix(in srgb, var(--highlight) 100%, var(--fg))';
    } else if (distance === 2) {
      chars[i].style.color = 'color-mix(in srgb, var(--highlight) 90%, var(--fg))';
    } else {
      // All other characters: default
      chars[i].style.color = '';
    }
  }
}

/**
 * Start the sheen animation
 * Frame starts at -2 so the highlight "enters" from the left,
 * and continues to length + 1 so it "exits" to the right.
 */
function startAnimation(element: HTMLElement): void {
  const state = sheenStates.get(element);
  if (!state) return;

  // Cancel any existing animation
  if (state.animationId !== null) {
    clearInterval(state.animationId);
  }

  // Start at -2 so the sheen enters from the left
  state.frame = -2;

  state.animationId = window.setInterval(() => {
    applyFrame(state.chars, state.frame);
    state.frame++;

    // Stop after the sheen has fully exited to the right
    if (state.frame > state.chars.length + 2) {
      if (state.animationId !== null) {
        clearInterval(state.animationId);
        state.animationId = null;
      }
      resetStyles(state.chars);
    }
  }, state.interval);
}

/**
 * Stop the sheen animation and reset styles
 */
function stopAnimation(element: HTMLElement): void {
  const state = sheenStates.get(element);
  if (!state) return;

  if (state.animationId !== null) {
    clearInterval(state.animationId);
    state.animationId = null;
  }

  resetStyles(state.chars);
}

/**
 * Initialise a single sheen element
 */
function initElement(element: HTMLElement): void {
  // Skip if already initialised
  if (sheenStates.has(element)) return;

  const text = element.dataset.sheenText;
  if (!text) return;

  const interval = parseInt(element.dataset.sheenInterval ?? '15', 10);
  const chars = splitIntoChars(element, text);

  const state: SheenState = {
    chars,
    interval,
    animationId: null,
    frame: 0,
  };

  sheenStates.set(element, state);

  element.addEventListener('mouseenter', () => startAnimation(element));
  element.addEventListener('mouseleave', () => stopAnimation(element));
}

/**
 * Initialise all sheen elements on the page
 */
function init(): void {
  const elements = document.querySelectorAll<HTMLElement>(SHEEN_SELECTOR);
  elements.forEach(initElement);
}

// Initialise on load and after Astro page transitions
init();
document.addEventListener('astro:after-swap', init);
