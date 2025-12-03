import { cleanup } from '@testing-library/react';

describe('index.tsx dynamic imports', () => {
    beforeEach(() => {
        // Ensure the root element exists before each test
        const div = document.createElement('div');
        div.setAttribute('id', 'app');
        document.body.appendChild(div);
    });

    afterEach(() => {
        // Clean up the root element after each test
        const div = document.getElementById('app');
        if (div) div.remove();
        jest.resetModules(); // Clear module cache for repeated imports
        cleanup();
    });

    it('should dynamically import App via index.tsx without throwing', async () => {
        await expect(import('../src/index')).resolves.toBeDefined();
    });

    it('should import App module directly without throwing', async () => {
        await expect(import('../src/App')).resolves.toBeDefined();
    });

    it('should not throw if index.tsx is imported multiple times', async () => {
        await expect(import('../src/index')).resolves.toBeDefined();
        jest.resetModules();
        await expect(import('../src/index')).resolves.toBeDefined();
    });

    it('should not throw if App is imported multiple times', async () => {
        await expect(import('../src/App')).resolves.toBeDefined();
        jest.resetModules();
        await expect(import('../src/App')).resolves.toBeDefined();
    });
});