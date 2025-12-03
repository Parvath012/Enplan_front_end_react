import { mapExecutionEngineFromAPI, mapFlowFileConcurrencyFromAPI, loadParameterContext } from './processGroupUtils';

/**
 * Default configuration values
 */
export const getDefaultConfigValues = (name: string) => ({
  configName: name,
  parameterContext: '',
  applyRecursively: false,
  executionEngine: 'Inherited',
  flowFileConcurrency: 'Single Batch Per Node',
  defaultFlowFileExpiration: '0 Sec',
  defaultBackPressureObjectThreshold: '10000',
  comments: '',
});

/**
 * Create initial values from component data
 */
export const createInitialValuesFromComponent = (component: any, name: string) => {
  const loadedParameterContext = loadParameterContext(component.parameterContext);
  
  return {
    configName: component.name || name,
    parameterContext: loadedParameterContext,
    applyRecursively: false, // This is not stored in API, so always false initially
    executionEngine: component.executionEngine ? mapExecutionEngineFromAPI(component.executionEngine) : 'Inherited',
    flowFileConcurrency: component.flowfileConcurrency ? mapFlowFileConcurrencyFromAPI(component.flowfileConcurrency) : 'Single Batch Per Node',
    defaultFlowFileExpiration: component.defaultFlowFileExpiration || '0 Sec',
    defaultBackPressureObjectThreshold: component.defaultBackPressureObjectThreshold !== undefined ? String(component.defaultBackPressureObjectThreshold) : '10000',
    comments: component.comments ?? '',
  };
};

/**
 * Common label style for form fields
 */
export const LABEL_STYLE: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#5F6368',
  fontWeight: 500,
};

/**
 * Common text field style
 */
export const TEXT_FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    fontSize: '12px',
    fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '& textarea': {
      fontSize: '12px',
      fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
};

