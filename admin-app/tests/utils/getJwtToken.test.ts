const mockGetState = jest.fn();
jest.mock('../../src/store/configureStore', () => ({
    __esModule: true,
    default: { getState: mockGetState }
}));

import { getJwtToken } from '../../src/utils/getJwtToken';

describe('getJwtToken', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return jwtToken from template state', () => {
        const mockToken = 'test-token';
        mockGetState.mockReturnValue({
            template: { jwtToken: mockToken }
        });

        const token = getJwtToken();
        expect(token).toBe(mockToken);
    });

    it('should return undefined if jwtToken is not present', () => {
        mockGetState.mockReturnValue({
            template: {}
        });

        const token = getJwtToken();
        expect(token).toBeUndefined();
    });

    it('should return undefined if template is not present', () => {
        mockGetState.mockReturnValue({});

        const token = getJwtToken();
        expect(token).toBeUndefined();
    });
});