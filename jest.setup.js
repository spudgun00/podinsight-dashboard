import '@testing-library/jest-dom'

// Mock HTMLMediaElement for audio tests
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve())
window.HTMLMediaElement.prototype.pause = jest.fn()
window.HTMLMediaElement.prototype.load = jest.fn()

// Add custom matchers
expect.extend({
  toBePlayingAudio(received) {
    const pass = received && !received.paused
    return {
      pass,
      message: () => pass 
        ? `expected audio element not to be playing`
        : `expected audio element to be playing`
    }
  }
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}