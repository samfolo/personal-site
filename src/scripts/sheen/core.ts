/**
 * Sheen Core
 *
 * Shared logic for the sheen text animation effect.
 * Used by both SheenText component and prose links.
 */

/**
 * State object for a sheen animation instance.
 */
export interface SheenState {
  /**
   * Character span elements in the animated text.
   */
  chars: HTMLSpanElement[];

  /**
   * Delay in milliseconds between each frame.
   */
  interval: number;

  /**
   * Number of characters in the highlight gradient.
   */
  spread: number;

  /**
   * Active setInterval ID, or null when stopped.
   */
  animationId: number | null;

  /**
   * Current frame index in the animation.
   */
  frame: number;
}

/**
 * CSS class applied to individual character spans.
 */
export const CHAR_CLASS = "sheen-char";

/**
 * CSS class applied to word wrapper spans.
 */
export const WORD_CLASS = "sheen-word";

/**
 * Split text into individual character spans, grouped by words to prevent mid-word breaks
 */
export const splitIntoChars = (
  element: HTMLElement,
  text: string
): HTMLSpanElement[] => {
  const chars: HTMLSpanElement[] = [];
  element.innerHTML = "";

  // Split by spaces, keeping track of words and spaces
  const words = text.split(/( )/);

  for (const word of words) {
    if (word === " ") {
      // Spaces between words
      const spaceSpan = document.createElement("span");
      spaceSpan.className = CHAR_CLASS;
      spaceSpan.innerHTML = "&nbsp;";
      element.appendChild(spaceSpan);
      chars.push(spaceSpan);
    } else if (word.length > 0) {
      // Wrap each word in a container to prevent mid-word breaks
      const wordSpan = document.createElement("span");
      wordSpan.className = WORD_CLASS;

      for (const char of word) {
        const charSpan = document.createElement("span");
        charSpan.className = CHAR_CLASS;
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
        chars.push(charSpan);
      }

      element.appendChild(wordSpan);
    }
  }

  return chars;
};

/**
 * Reset all characters to default styles
 */
export const resetStyles = (chars: HTMLSpanElement[]): void => {
  for (const char of chars) {
    char.style.color = "";
  }
};

/**
 * Apply sheen colours at the current frame position
 * Creates a gradient from centre (100% highlight) to edges
 */
export const applyFrame = (
  chars: HTMLSpanElement[],
  frame: number,
  spread: number
): void => {
  for (let i = 0; i < chars.length; i++) {
    const distance = Math.abs(i - frame);

    if (distance === 0) {
      // Centre character: full highlight
      chars[i].style.color = "var(--highlight)";
    } else if (distance <= spread) {
      // Gradient falloff based on distance
      const intensity = 100 - (distance - 1) * (20 / spread);
      chars[i].style.color =
        `color-mix(in srgb, var(--highlight) ${Math.round(intensity)}%, var(--fg))`;
    } else {
      // All other characters: default
      chars[i].style.color = "";
    }
  }
};

/**
 * Start the sheen animation on an element
 */
export const startAnimation = (state: SheenState): void => {
  // Cancel any existing animation
  if (state.animationId !== null) {
    clearInterval(state.animationId);
  }

  // Start at -spread so the sheen enters from the left
  state.frame = -state.spread;

  state.animationId = window.setInterval(() => {
    applyFrame(state.chars, state.frame, state.spread);
    state.frame++;

    // Stop after the sheen has fully exited to the right
    if (state.frame > state.chars.length + state.spread) {
      if (state.animationId !== null) {
        clearInterval(state.animationId);
        state.animationId = null;
      }
      resetStyles(state.chars);
    }
  }, state.interval);
};

/**
 * Stop the sheen animation and reset styles
 */
export const stopAnimation = (state: SheenState): void => {
  if (state.animationId !== null) {
    clearInterval(state.animationId);
    state.animationId = null;
  }

  resetStyles(state.chars);
};

/**
 * Create a new sheen state object
 */
export const createState = (
  chars: HTMLSpanElement[],
  interval: number,
  spread: number
): SheenState => ({
  chars,
  interval,
  spread,
  animationId: null,
  frame: 0,
});
