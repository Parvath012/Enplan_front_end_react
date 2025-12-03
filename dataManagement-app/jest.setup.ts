import '@testing-library/jest-dom';

global.TextEncoder = require('util').TextEncoder;

// Polyfill for MessageChannel (required for React DOM server in tests)
if (typeof MessageChannel === 'undefined') {
  global.MessageChannel = class MessageChannel {
    port1: any;
    port2: any;
    
    constructor() {
      this.port1 = {
        onmessage: null,
        postMessage: jest.fn(),
        close: jest.fn(),
      };
      this.port2 = {
        onmessage: null,
        postMessage: jest.fn((data: any) => {
          if (this.port1.onmessage) {
            this.port1.onmessage({ data });
          }
        }),
        close: jest.fn(),
      };
    }
  } as any;
}