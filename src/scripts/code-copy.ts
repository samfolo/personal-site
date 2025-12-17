/**
 * Code Block Enhancement Script
 *
 * - Populates language labels from Shiki's data-language attribute (sentence case)
 * - Adds copy-to-clipboard functionality
 */

const COPIED_DURATION = 2000;

/**
 * Convert language string to sentence case.
 * e.g., "typescript" -> "Typescript", "html" -> "Html"
 */
const toSentenceCase = (str: string): string => {
  if (!str) {
    return '';
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const init = (): void => {
  const codeBlocks = document.querySelectorAll<HTMLElement>('.code-block');

  codeBlocks.forEach((block) => {
    const pre = block.querySelector<HTMLPreElement>('pre');
    const code = pre?.querySelector<HTMLElement>('code');
    const langLabel = block.querySelector<HTMLElement>('.code-lang');
    const copyButton = block.querySelector<HTMLButtonElement>('.code-copy');

    // Populate language label from Shiki's data-language attribute
    if (langLabel && pre) {
      const lang = pre.dataset.language || '';
      langLabel.textContent = toSentenceCase(lang);
    }

    if (!code || !copyButton) {
      return;
    }

    // Skip if already initialised
    if (copyButton.dataset.copyInit) {
      return;
    }
    copyButton.dataset.copyInit = 'true';

    copyButton.addEventListener('click', async () => {
      const text = code.textContent || '';

      try {
        await navigator.clipboard.writeText(text);
        copyButton.textContent = 'Copied';

        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, COPIED_DURATION);
      } catch (err) {
        console.warn('Failed to copy code:', err);
        copyButton.textContent = 'Error';

        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, COPIED_DURATION);
      }
    });
  });
};

// Initialise on load
init();

// Re-initialise after Astro page transitions
document.addEventListener('astro:after-swap', init);
