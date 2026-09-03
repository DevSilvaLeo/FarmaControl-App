import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// `matchMedia` não existe no jsdom — o Ant Design (responsive observers) o usa.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// `ResizeObserver` — usado por Modal/Drawer/Tabs do Ant Design (rc-component).
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

// `scrollTo` — chamado por alguns componentes ao focar/abrir.
if (!window.scrollTo) {
  window.scrollTo = (() => {}) as typeof window.scrollTo;
}

afterEach(() => {
  cleanup();
});
