import '@testing-library/jest-dom';

// antd components query matchMedia for responsive behavior; jsdom does not
// implement it, so components using it (Form, Grid, etc.) crash on mount
// without this polyfill.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

