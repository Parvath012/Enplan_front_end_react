import React from 'react';
import { Renew } from '@carbon/icons-react';

// Props for DataRefreshButton
type Props = {
  onRefresh?: () => void; // Callback for refresh action
};

// Button to trigger data refresh
const DataRefreshButton: React.FC<Props> = ({ onRefresh }) => (
  <button
    type="button"
    className="data-refresh"
    onClick={onRefresh}
    aria-label="Refresh data"
    disabled={!onRefresh}
  >
    {/* Refresh icon */}
    <Renew className="refresh-icon" />
    Data Refresh
  </button>
);

export default DataRefreshButton;