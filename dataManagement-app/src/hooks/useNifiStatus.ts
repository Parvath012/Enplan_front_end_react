import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startNifiStatusPolling, stopNifiStatusPolling } from '../store/Actions/nifiActions';
import { RootState } from '../store/configureStore';

export const useNifiStatus = (pollInterval = 10000) => {
  const dispatch = useDispatch();
  const { status, loading, error, lastUpdated } = useSelector((state: RootState) => state.nifi);

  useEffect(() => {
    // Start polling when component mounts
    const stopPolling = dispatch(startNifiStatusPolling(pollInterval) as any);
    
    // Clean up polling when component unmounts
    return () => {
      if (stopPolling && typeof stopPolling === 'function') {
        stopPolling();
      } else {
        dispatch(stopNifiStatusPolling() as any);
      }
    };
  }, [dispatch, pollInterval]);

  // Helper function to format values for the footer
  const getFormattedValue = (key: string): string => {
    if (!status) return '0';

    switch (key) {
      case 'activeThreads':
        return status.activeThreadCount.toString();
      case 'queuedBytes':
        return status.queued || '0/0 bytes';
      case 'queuedItems1': // activeRemotePortCount
        return status.activeRemotePortCount.toString();
      case 'queuedItems2': // inactiveRemotePortCount
        return status.inactiveRemotePortCount.toString();
      case 'startCount': // runningCount
        return status.runningCount.toString();
      case 'stopCount': // stoppedCount
        return status.stoppedCount.toString();
      case 'queuedItems3': // invalidCount
        return status.invalidCount.toString();
      case 'queuedItems4': // disabledCount
        return status.disabledCount.toString();
      case 'queuedItems5': // upToDateCount
        return status.upToDateCount.toString();
      case 'queuedItems6': // locallyModifiedCount
        return status.locallyModifiedCount.toString();
      case 'queuedItems7': // staleCount
        return status.staleCount.toString();
      case 'queuedItems8': // locallyModifiedAndStaleCount
        return status.locallyModifiedAndStaleCount.toString();
      case 'queuedItems9': // syncFailureCount
        return status.syncFailureCount.toString();
      default:
        return '0';
    }
  };

  return {
    status,
    loading,
    error,
    lastUpdated,
    getFormattedValue,
  };
};
