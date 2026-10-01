// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom does not implement window.scrollTo, but our app uses it in
// ScrollToTop. Stub it for the test environment so components can mount.
window.scrollTo = () => {};

// jsdom has no <canvas> implementation (the captcha draws on one). A do-nothing 2D context is enough
// for tests that only need the component tree to mount.
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = function getContext() {
    return new Proxy(
      { canvas: this },
      {
        get: (target, prop) => (prop in target ? target[prop] : () => ({ addColorStop: () => {} })),
        set: () => true,
      }
    );
  };
}

// jsdom has no IntersectionObserver (used by the scroll-reveal wrapper). Report everything as visible.
if (typeof window.IntersectionObserver === "undefined") {
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      this.callback([{ isIntersecting: true, target, intersectionRatio: 1 }], this);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}
