/**
 * Default values for processor statistics (matching ProcessGroupBox format)
 */
const DEFAULT_STATS = {
  queued: '0 (0 bytes)',
  input: '0 (0 bytes)',
  read: '0 bytes',
  written: '0 bytes',
  output: '0 (0 bytes)',
} as const;

/**
 * Maps a NiFi Processor response to ProcessGroupBox display format
 * This allows processors to use the same ProcessGroupBox component
 * @param processor - The API response for a processor
 * @returns Mapped processor in ProcessGroupBox format
 */
export const mapProcessorForDisplay = (processor: any) => {
  const component = processor.component || {};
  const status = processor.status || {};
  const runStatus = component.state || 'STOPPED';
  
  // Extract processor name (type name if name not set)
  const name = component.name || component.type?.split('.').pop() || 'Unknown Processor';
  
  // Extract processor type and bundle information
  const processorType = component.type || '';
  const bundle = component.bundle || {};
  const bundleGroup = bundle.group || '';
  const bundleArtifact = bundle.artifact || '';
  const bundleVersion = bundle.version || '';
  
  // Determine counts based on state (for ProcessGroupBox format)
  const runningCount = runStatus === 'RUNNING' ? 1 : 0;
  const stoppedCount = runStatus === 'STOPPED' ? 1 : 0;
  const invalidCount = component.validationStatus?.state === 'INVALID' ? 1 : 0;
  const disabledCount = runStatus === 'DISABLED' ? 1 : 0;
  
  // Extract status metrics (matching ProcessGroupBox format)
  const aggregateSnapshot = status.aggregateSnapshot || {};
  
  // Extract task/time information
  const taskCount = aggregateSnapshot.taskCount || 0;
  const taskDuration = aggregateSnapshot.taskDuration || '00:00:00.000';
  
  // Format task/time display
  const formatTaskTime = (count: number, duration: string) => {
    return `${count} / ${duration}`;
  };
  const taskTime = formatTaskTime(taskCount, taskDuration);
  
  // Ensure position is visible - if position is too far off-screen, use default visible position
  const rawPosition = component.position || { x: 0, y: 0 };
  // If position is way off-screen (x > 2000), use a visible default position
  const position = rawPosition.x > 2000 ? { x: 50, y: 50 } : rawPosition;
  
  return {
    id: processor.id || component.id,
    name,
    parameterContext: 'None', // Processors don't have parameter context
    position,
    runningCount,
    stoppedCount,
    invalidCount,
    disabledCount,
    activeRemotePortCount: 0, // Processors don't have remote ports
    inactiveRemotePortCount: 0,
    queued: aggregateSnapshot.queued || DEFAULT_STATS.queued,
    input: aggregateSnapshot.input || DEFAULT_STATS.input,
    read: aggregateSnapshot.read || DEFAULT_STATS.read,
    written: aggregateSnapshot.written || DEFAULT_STATS.written,
    output: aggregateSnapshot.output || DEFAULT_STATS.output,
    upToDateCount: 0, // Processors don't have versioning
    locallyModifiedCount: 0,
    staleCount: 0,
    locallyModifiedAndStaleCount: 0,
    syncFailureCount: 0,
    // Processor-specific fields
    isProcessor: true,
    processorType,
    bundleGroup,
    bundleArtifact,
    bundleVersion,
    taskTime,
    taskCount,
    taskDuration,
  };
};

/**
 * Maps an array of processor responses to ProcessGroupBox format
 * @param processors - Array of API responses
 * @returns Array of mapped processors in ProcessGroupBox format
 */
export const mapProcessorsForDisplay = (processors: any[]) => {
  if (!processors || !Array.isArray(processors)) {
    return [];
  }
  return processors.map(mapProcessorForDisplay);
};

