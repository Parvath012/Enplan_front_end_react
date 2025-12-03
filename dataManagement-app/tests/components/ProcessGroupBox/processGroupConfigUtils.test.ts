import {
  getDefaultConfigValues,
  createInitialValuesFromComponent,
  LABEL_STYLE,
  TEXT_FIELD_SX
} from '../../../src/components/ProcessGroupBox/processGroupConfigUtils';
import * as processGroupUtils from '../../../src/components/ProcessGroupBox/processGroupUtils';

// Mock processGroupUtils
jest.mock('../../../src/components/ProcessGroupBox/processGroupUtils', () => ({
  mapExecutionEngineFromAPI: jest.fn((val) => val),
  mapFlowFileConcurrencyFromAPI: jest.fn((val) => val),
  loadParameterContext: jest.fn((val) => val?.id || val?.name || '')
}));

describe('processGroupConfigUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultConfigValues', () => {
    it('should return default values with provided name', () => {
      const result = getDefaultConfigValues('Test Process Group');

      expect(result).toEqual({
        configName: 'Test Process Group',
        parameterContext: '',
        applyRecursively: false,
        executionEngine: 'Inherited',
        flowFileConcurrency: 'Single Batch Per Node',
        defaultFlowFileExpiration: '0 Sec',
        defaultBackPressureObjectThreshold: '10000',
        comments: ''
      });
    });

    it('should handle empty name', () => {
      const result = getDefaultConfigValues('');

      expect(result.configName).toBe('');
    });
  });

  describe('createInitialValuesFromComponent', () => {
    it('should create initial values from component with all fields', () => {
      const component = {
        name: 'Test Component',
        parameterContext: { id: 'test-context-id' },
        executionEngine: 'STANDARD',
        flowfileConcurrency: 'UNBOUNDED',
        defaultFlowFileExpiration: '60 Sec',
        defaultBackPressureObjectThreshold: 5000,
        comments: 'Test comments'
      };

      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('test-context-id');
      (processGroupUtils.mapExecutionEngineFromAPI as jest.Mock).mockReturnValue('Standard');
      (processGroupUtils.mapFlowFileConcurrencyFromAPI as jest.Mock).mockReturnValue('Unbounded');

      const result = createInitialValuesFromComponent(component, 'Default Name');

      expect(result.configName).toBe('Test Component');
      expect(result.parameterContext).toBe('test-context-id');
      expect(result.applyRecursively).toBe(false);
      expect(result.executionEngine).toBe('Standard');
      expect(result.flowFileConcurrency).toBe('Unbounded');
      expect(result.defaultFlowFileExpiration).toBe('60 Sec');
      expect(result.defaultBackPressureObjectThreshold).toBe('5000');
      expect(result.comments).toBe('Test comments');
    });

    it('should use provided name when component name is missing', () => {
      const component = {};
      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('');

      const result = createInitialValuesFromComponent(component, 'Default Name');

      expect(result.configName).toBe('Default Name');
    });

    it('should use default execution engine when missing', () => {
      const component = {};
      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('');

      const result = createInitialValuesFromComponent(component, 'Test');

      expect(result.executionEngine).toBe('Inherited');
    });

    it('should use default flowFileConcurrency when missing', () => {
      const component = {};
      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('');

      const result = createInitialValuesFromComponent(component, 'Test');

      expect(result.flowFileConcurrency).toBe('Single Batch Per Node');
    });

    it('should use default expiration when missing', () => {
      const component = {};
      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('');

      const result = createInitialValuesFromComponent(component, 'Test');

      expect(result.defaultFlowFileExpiration).toBe('0 Sec');
    });

    it('should use default back pressure threshold when missing', () => {
      const component = {};
      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('');

      const result = createInitialValuesFromComponent(component, 'Test');

      expect(result.defaultBackPressureObjectThreshold).toBe('10000');
    });

    it('should convert back pressure threshold to string', () => {
      const component = {
        defaultBackPressureObjectThreshold: 15000
      };
      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('');

      const result = createInitialValuesFromComponent(component, 'Test');

      expect(result.defaultBackPressureObjectThreshold).toBe('15000');
    });

    it('should use empty string for comments when missing', () => {
      const component = {};
      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('');

      const result = createInitialValuesFromComponent(component, 'Test');

      expect(result.comments).toBe('');
    });

    it('should use nullish coalescing for comments', () => {
      const component = { comments: null };
      (processGroupUtils.loadParameterContext as jest.Mock).mockReturnValue('');

      const result = createInitialValuesFromComponent(component, 'Test');

      expect(result.comments).toBe('');
    });
  });

  describe('LABEL_STYLE', () => {
    it('should have correct style properties', () => {
      expect(LABEL_STYLE).toEqual({
        fontSize: '12px',
        fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#5F6368',
        fontWeight: 500
      });
    });
  });

  describe('TEXT_FIELD_SX', () => {
    it('should have correct style properties', () => {
      expect(TEXT_FIELD_SX).toEqual({
        '& .MuiOutlinedInput-root': {
          fontSize: '12px',
          fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '& textarea': {
            fontSize: '12px',
            fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }
        }
      });
    });
  });
});

