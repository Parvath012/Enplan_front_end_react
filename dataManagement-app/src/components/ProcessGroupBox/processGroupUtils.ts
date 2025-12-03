/**
 * Map execution engine value from API format to display format
 */
export const mapExecutionEngineFromAPI = (value: string): string => {
  switch (value.toUpperCase()) {
    case 'INHERITED':
      return 'Inherited';
    case 'STANDARD':
      return 'Standard';
    case 'STATELESS':
      return 'Stateless';
    default:
      return value;
  }
};

/**
 * Map flow file concurrency value from API format to display format
 */
export const mapFlowFileConcurrencyFromAPI = (value: string): string => {
  switch (value.toUpperCase()) {
    case 'UNBOUNDED':
      return 'Unbounded';
    case 'SINGLE_FLOWFILE_PER_NODE':
      return 'Single FlowFile Per Node';
    case 'SINGLE_BATCH_PER_NODE':
      return 'Single Batch Per Node';
    default:
      return value;
  }
};

/**
 * Check if a string is a valid UUID
 */
export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Load parameter context from component data
 */
export const loadParameterContext = (parameterContext: any): string => {
  if (!parameterContext) {
    return '';
  }
  
  const parameterContextOptions = ['Dataflow_Dev', 'ETL_Prod', 'API_Gateway_Staging'];
  
  // Priority 1: If we have a valid UUID, use it
  if (parameterContext.id && isValidUUID(parameterContext.id)) {
    return parameterContext.id;
  }
  
  // Priority 2 & 3: Check if name or ID matches our options
  const candidateValue = parameterContext.name ?? parameterContext.id;
  return (candidateValue && parameterContextOptions.includes(candidateValue)) ? candidateValue : '';
};

