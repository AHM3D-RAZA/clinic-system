import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement IntersectionObserver; RevealOnScroll uses it,
// so components that render it (most marketing sections) need a stub
// or they'd throw in every test that mounts them.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
  takeRecords = () => [];
}

global.IntersectionObserver = MockIntersectionObserver;

// jsdom doesn't implement matchMedia; Hero's parallax effect checks
// prefers-reduced-motion on mount.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
