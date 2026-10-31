import "@testing-library/jest-dom";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis,"ResizeObserver",{
  writable:true,
  configurable:true,
  value:ResizeObserverMock
});

class IntersectionObserverMock {
  callback:IntersectionObserverCallback;
  constructor(callback:IntersectionObserverCallback){this.callback=callback;}
  observe(target:Element){this.callback([{isIntersecting:true,target} as IntersectionObserverEntry],this as unknown as IntersectionObserver);}
  unobserve() {}
  disconnect() {}
  takeRecords(){return [];}
}
Object.defineProperty(globalThis,"IntersectionObserver",{
  writable:true,
  configurable:true,
  value:IntersectionObserverMock
});
