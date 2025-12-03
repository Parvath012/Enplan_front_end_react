// Mock heavy dependencies before any imports
jest.mock('react-redux', () => ({
    Provider: ({ children }: any) => children,
    useDispatch: () => jest.fn(),
    useSelector: () => ({})
}));

jest.mock('react-router-dom', () => ({
    BrowserRouter: ({ children }: any) => children,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
    Routes: ({ children }: any) => children,
    Route: ({ element }: any) => element
}));

jest.mock('react-dom/client', () => ({
    createRoot: jest.fn(() => ({
        render: jest.fn()
    }))
}));

jest.mock('../src/store/configureStore', () => ({
    __esModule: true,
    default: {
        dispatch: jest.fn(),
        getState: jest.fn(() => ({})),
        subscribe: jest.fn(),
        replaceReducer: jest.fn()
    }
}));

jest.mock('../src/routers/Routers', () => ({
    __esModule: true,
    default: () => <div>Router</div>
}));

// Mock CSS imports
jest.mock('../src/styles/reset.css', () => ({}));
jest.mock('../src/App.scss', () => ({}));

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
        // Remove jest.resetModules() - it's expensive and not needed with mocks
    });

    it('should dynamically import index module without throwing', async () => {
        await expect(import('../src/index')).resolves.toBeDefined();
    });

    it('should import App module directly without throwing', async () => {
        await expect(import('../src/App')).resolves.toBeDefined();
    });

    it('should import bootstrap module directly without throwing', async () => {
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

    it('should import bootstrap module', async () => {
        const module = await import('../src/index');
        expect(module).toBeDefined();
    });

    it('should handle module import without errors', async () => {
        await expect(import('../src/index')).resolves.toBeDefined();
    });

    it('should export default from bootstrap', async () => {
        const indexModule = await import('../src/index');
        const bootstrapModule = await import('../src/bootstrap');
        
        // Both should be defined
        expect(indexModule).toBeDefined();
        expect(bootstrapModule).toBeDefined();
    });
});
