import React from 'react';

// Defines a single stat's key and label
type Stat = { key: string; label: string };

// Props for StatsDisplay component
type Props = {
  statsConfig: Stat[]; // Array of stats to display
  statsData: Record<string, number | string>; // Actual stat values
};

// Renders a list of stats with separators
const StatsDisplay: React.FC<Props> = ({ statsConfig, statsData }) => (
  <>
    {statsConfig.map((stat, idx) => (
      <React.Fragment key={stat.key}>
        {/* Display stat label and value */}
        <span>
          {stat.label}: {statsData[stat.key]}
        </span>
        {/* Add separator except after last item */}
        {idx < statsConfig.length - 1 && <span className="separator">|</span>}
      </React.Fragment>
    ))}
  </>
);

export default StatsDisplay;