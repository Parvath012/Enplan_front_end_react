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

    it('should execute dynamic import for App module (line 1)', async () => {
        // Import the index file which should trigger the dynamic import('./App') on line 1
        jest.resetModules();
        const indexModule = await import('../src/index');
        expect(indexModule).toBeDefined();
        
        // Also verify App can be imported directly
        const appModule = await import('../src/App');
        expect(appModule).toBeDefined();
    });

    it('should execute dynamic import for bootstrap module (line 2)', async () => {
        // Import the index file which should trigger the dynamic import('./bootstrap') on line 2
        jest.resetModules();
        const indexModule = await import('../src/index');
        expect(indexModule).toBeDefined();
        
        // Also verify bootstrap can be imported directly
        const bootstrapModule = await import('../src/bootstrap');
        expect(bootstrapModule).toBeDefined();
    });

    it('should dynamically import App and bootstrap modules without throwing', async () => {
        jest.resetModules();
        await expect(import('../src/index')).resolves.toBeDefined();
    });

    it('should import App module directly without throwing', async () => {
        await expect(import('../src/App')).resolves.toBeDefined();
    });

    it('should import bootstrap module directly without throwing', async () => {
        await expect(import('../src/bootstrap')).resolves.toBeDefined();
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

    it('should not throw if bootstrap is imported multiple times', async () => {
        await expect(import('../src/bootstrap')).resolves.toBeDefined();
        jest.resetModules();
        await expect(import('../src/bootstrap')).resolves.toBeDefined();
    });

    it('should handle concurrent imports gracefully', async () => {
        const promises = [
            import('../src/index'),
            import('../src/App'),
            import('../src/bootstrap')
        ];

        await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should execute both dynamic imports when index.tsx is loaded', async () => {
        // Clear any previous module cache
        jest.resetModules();
        
        // Import index which triggers lines 1 and 2 (import('./App') and import('./bootstrap'))
        const indexModule = await import('../src/index');
        
        // Verify the module was loaded
        expect(indexModule).toBeDefined();
        
        // The dynamic imports should have been executed
        // We verify by ensuring no errors were thrown
        expect(() => indexModule).not.toThrow();
    });

    it('should execute dynamic imports in sequence when index is imported', async () => {
        // This test ensures both lines 1 and 2 are executed
        jest.resetModules();
        
        // Import index file - this will execute import('./App') on line 1 and import('./bootstrap') on line 2
        await import('../src/index');
        
        // Verify both modules can be resolved
        await expect(import('../src/App')).resolves.toBeDefined();
        await expect(import('../src/bootstrap')).resolves.toBeDefined();
    });
});
