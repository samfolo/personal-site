/**
 * Code Block Enhancement Script
 *
 * - Populates language labels from Shiki's data-language attribute
 * - Adds copy-to-clipboard functionality
 */

((): void => {
  /**
   * Duration in milliseconds to show "Copied" feedback.
   */
  const COPIED_DURATION = 2000;

  const init = (): void => {
    const codeBlocks = document.querySelectorAll<HTMLElement>(".code-block");

    codeBlocks.forEach((block) => {
      const pre = block.querySelector<HTMLPreElement>("pre");
      const code = pre?.querySelector<HTMLElement>("code");
      const langLabel = block.querySelector<HTMLElement>(".code-lang");
      const copyButton = block.querySelector<HTMLButtonElement>(".code-copy");

      // Populate language label from Shiki's data-language attribute
      if (langLabel && pre) {
        langLabel.textContent = pre.dataset.language || "";
      }

      if (!code || !copyButton) {
        return;
      }

      // Skip if already initialised
      if (copyButton.dataset.copyInit) {
        return;
      }
      copyButton.dataset.copyInit = "true";

      copyButton.addEventListener("click", async () => {
        const text = code.textContent || "";

        try {
          await navigator.clipboard.writeText(text);
          copyButton.textContent = "Copied";

          setTimeout(() => {
            copyButton.textContent = "Copy";
          }, COPIED_DURATION);
        } catch (err) {
          console.warn("Failed to copy code:", err);
          copyButton.textContent = "Error";

          setTimeout(() => {
            copyButton.textContent = "Copy";
          }, COPIED_DURATION);
        }
      });
    });
  };

  // Initialise on load
  init();

  // Re-initialise after Astro page transitions
  document.addEventListener("astro:after-swap", init);
})();
