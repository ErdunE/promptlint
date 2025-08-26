/**
 * DOM manipulation utilities for site adapters
 * Provides helper functions for robust element finding and interaction
 */

/**
 * Wait for an element to appear in the DOM
 */
export function waitForElement(
  selector: string,
  timeout = 5000,
  validator?: (element: Element) => boolean
): Promise<Element | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      try {
        const element = document.querySelector(selector);
        if (element && (!validator || validator(element))) {
          resolve(element);
          return;
        }
      } catch {
        // Invalid selector, continue checking
      }
      
      if (Date.now() - startTime >= timeout) {
        resolve(null);
        return;
      }
      
      setTimeout(check, 100);
    };
    
    check();
  });
}

/**
 * Wait for multiple elements to appear
 */
export function waitForElements(
  selectors: string[],
  timeout = 5000,
  requireAll = false
): Promise<Element[]> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      const currentFound: Element[] = [];
      
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            currentFound.push(element);
          }
        } catch {
          // Invalid selector, skip
        }
      }
      
      if (requireAll && currentFound.length === selectors.length) {
        resolve(currentFound);
        return;
      }
      
      if (!requireAll && currentFound.length > 0) {
        resolve(currentFound);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        resolve(currentFound);
        return;
      }
      
      setTimeout(check, 100);
    };
    
    check();
  });
}

/**
 * Check if element is visible and interactable
 */
export function isElementVisible(element: Element): boolean {
  const htmlElement = element as HTMLElement;
  
  // Check if element exists and has dimensions
  if (!htmlElement.offsetParent && htmlElement.offsetWidth === 0 && htmlElement.offsetHeight === 0) {
    return false;
  }
  
  // Check computed styles
  const styles = window.getComputedStyle(htmlElement);
  if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
    return false;
  }
  
  return true;
}

/**
 * Check if element is interactable (not disabled, readonly, etc.)
 */
export function isElementInteractable(element: Element): boolean {
  const htmlElement = element as HTMLElement;
  
  // Check if element is disabled
  if ('disabled' in htmlElement && (htmlElement as any).disabled) {
    return false;
  }
  
  // Check if element is readonly
  if ('readOnly' in htmlElement && (htmlElement as any).readOnly) {
    return false;
  }
  
  // Check aria-disabled
  if (htmlElement.getAttribute('aria-disabled') === 'true') {
    return false;
  }
  
  return true;
}

/**
 * Get element's position relative to viewport
 */
export function getElementPosition(element: Element): {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height
  };
}

/**
 * Check if element is in viewport
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * Scroll element into view smoothly
 */
export function scrollElementIntoView(element: Element, behavior: 'auto' | 'smooth' = 'smooth'): void {
  element.scrollIntoView({
    behavior,
    block: 'center',
    inline: 'center'
  });
}

/**
 * Create a mutation observer for element changes
 */
export function observeElementChanges(
  element: Element,
  callback: (mutations: MutationRecord[]) => void,
  options: MutationObserverInit = { childList: true, subtree: true }
): MutationObserver {
  const observer = new MutationObserver(callback);
  observer.observe(element, options);
  return observer;
}

/**
 * Wait for DOM to be ready
 */
export function waitForDOM(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    } else {
      resolve();
    }
  });
}

/**
 * Simulate user input event
 */
export function simulateInput(element: Element, value: string): void {
  const htmlElement = element as HTMLInputElement | HTMLTextAreaElement;
  
  // Set value
  if ('value' in htmlElement) {
    htmlElement.value = value;
  } else if (element.getAttribute('contenteditable') === 'true') {
    (element as HTMLElement).textContent = value;
  }
  
  // Dispatch events
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Simulate click event
 */
export function simulateClick(element: Element): void {
  element.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  }));
}

/**
 * Find element by text content
 */
export function findElementByText(
  text: string,
  tagName?: string,
  exact = false
): Element | null {
  const xpath = tagName
    ? `//${tagName}[${exact ? 'text()' : 'contains(text())'} = '${text}']`
    : `//*[${exact ? 'text()' : 'contains(text())'} = '${text}']`;
  
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  
  return result.singleNodeValue as Element | null;
}

/**
 * Get all elements matching any of the provided selectors
 */
export function querySelectorAll(selectors: string[]): Element[] {
  const elements: Element[] = [];
  
  for (const selector of selectors) {
    try {
      const found = Array.from(document.querySelectorAll(selector));
      elements.push(...found);
    } catch {
      // Invalid selector, skip
    }
  }
  
  // Remove duplicates
  return Array.from(new Set(elements));
}

/**
 * Find the best matching element from multiple selectors
 */
export function findBestElement(
  selectors: string[],
  validator?: (element: Element) => boolean
): Element | null {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element && isElementVisible(element) && isElementInteractable(element)) {
        if (!validator || validator(element)) {
          return element;
        }
      }
    } catch {
      // Invalid selector, continue
    }
  }
  
  return null;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
