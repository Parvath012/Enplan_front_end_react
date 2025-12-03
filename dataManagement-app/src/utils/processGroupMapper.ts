import { ProcessGroupResponse } from '../api/nifi/nifiApiService';

/**
 * Default values for process group statistics
 */
const DEFAULT_STATS = {
  queued: '0 (0 bytes)',
  input: '0 (0 bytes)',
  read: '0 bytes',
  written: '0 bytes',
  output: '0 (0 bytes)',
} as const;

/**
 * Maps a NiFi ProcessGroupResponse to a display-friendly process group object
 * @param group - The API response for a process group
 * @returns Mapped process group with all necessary display properties
 */
export const mapProcessGroupForDisplay = (group: ProcessGroupResponse) => ({
  id: group.id,
  name: group.component.name,
  parameterContext: 'None',
  position: group.component.position,
  runningCount: group.component.runningCount,
  stoppedCount: group.component.stoppedCount,
  invalidCount: group.component.invalidCount,
  disabledCount: group.component.disabledCount,
  activeRemotePortCount: group.component.activeRemotePortCount,
  inactiveRemotePortCount: group.component.inactiveRemotePortCount,
  queued: group.status?.aggregateSnapshot?.queued ?? DEFAULT_STATS.queued,
  input: group.status?.aggregateSnapshot?.input ?? DEFAULT_STATS.input,
  read: group.status?.aggregateSnapshot?.read ?? DEFAULT_STATS.read,
  written: group.status?.aggregateSnapshot?.written ?? DEFAULT_STATS.written,
  output: group.status?.aggregateSnapshot?.output ?? DEFAULT_STATS.output,
  upToDateCount: group.component.upToDateCount,
  locallyModifiedCount: group.component.locallyModifiedCount,
  staleCount: group.component.staleCount,
  locallyModifiedAndStaleCount: group.component.locallyModifiedAndStaleCount,
  syncFailureCount: group.component.syncFailureCount,
});

/**
 * Maps an array of process group responses
 * @param groups - Array of API responses
 * @returns Array of mapped process groups
 */
export const mapProcessGroupsForDisplay = (groups: ProcessGroupResponse[]) => 
  groups.map(mapProcessGroupForDisplay);

