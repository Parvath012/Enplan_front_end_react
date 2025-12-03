import '@testing-library/jest-dom';

// Add TextEncoder
global.TextEncoder = require('util').TextEncoder;

// Mock import.meta for Jest environment
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      url: 'file:///mock/url'
    }
  },
  writable: true
});

// Mock MessageChannel for server-side rendering tests
class MessageChannelMock {
  port1: any;
  port2: any;

  constructor() {
    this.port1 = {
      postMessage: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    this.port2 = {
      postMessage: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  }
}

global.MessageChannel = MessageChannelMock;
