/**
 * View Transitions Controller
 *
 * Manages view transitions based on navigation type:
 * - Home ↔ any page: Full page transition (everything fades)
 * - Non-home ↔ non-home: Content-only transition (header/footer persist)
 */

const HOME_PATH = '/';

/**
 * Check if a path is the home page
 */
function isHomePage(path: string): boolean {
  return path === HOME_PATH;
}

/**
 * Set view-transition-name on an element
 */
function setTransitionName(element: Element | null, name: string | null): void {
  if (element instanceof HTMLElement) {
    if (name) {
      element.style.viewTransitionName = name;
    } else {
      element.style.removeProperty('view-transition-name');
    }
  }
}

/**
 * Apply content-only transition mode to a document
 * Header and footer get their own transition names (no animation)
 * Main content gets its own transition name (animated)
 */
function applyContentOnlyMode(doc: Document): void {
  const header = doc.getElementById('fixed-header');
  const footer = doc.getElementById('fixed-footer');
  const main = doc.querySelector('main');

  setTransitionName(header, 'header');
  setTransitionName(footer, 'footer');
  setTransitionName(main, 'main-content');
}

/**
 * Apply full page transition mode to a document
 * Remove all custom transition names, let root handle everything
 */
function applyFullPageMode(doc: Document): void {
  const header = doc.getElementById('fixed-header');
  const footer = doc.getElementById('fixed-footer');
  const main = doc.querySelector('main');

  setTransitionName(header, null);
  setTransitionName(footer, null);
  setTransitionName(main, null);
}

/**
 * Handle before-swap event
 * Set transition names on BOTH old (current) and new documents
 */
function handleBeforeSwap(event: Event): void {
  const customEvent = event as CustomEvent<{
    from: URL;
    to: URL;
    newDocument: Document;
  }>;

  const fromPath = customEvent.detail.from.pathname;
  const toPath = customEvent.detail.to.pathname;
  const newDocument = customEvent.detail.newDocument;

  const fromHome = isHomePage(fromPath);
  const toHome = isHomePage(toPath);

  // Full page transition when navigating to or from home
  // Content-only transition when navigating between non-home pages
  if (fromHome || toHome) {
    applyFullPageMode(document);
    applyFullPageMode(newDocument);
  } else {
    applyContentOnlyMode(document);
    applyContentOnlyMode(newDocument);
  }
}

/**
 * Reset transition names after navigation completes
 */
function handleAfterSwap(): void {
  // Reset to full page mode after transition completes
  requestAnimationFrame(() => {
    applyFullPageMode(document);
  });
}

// Initialise listeners
document.addEventListener('astro:before-swap', handleBeforeSwap);
document.addEventListener('astro:after-swap', handleAfterSwap);
