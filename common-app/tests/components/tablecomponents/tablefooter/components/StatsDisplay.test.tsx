import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsDisplay from '../../../../../src/components/tablecomponents/tablefooter/components/StatsDisplay';

describe('StatsDisplay', () => {
  const statsConfig = [
    { key: 'totalRows', label: 'Total rows' },
    { key: 'sum', label: 'Sum' },
    { key: 'avg', label: 'Avg' },
    { key: 'min', label: 'Min' },
    { key: 'max', label: 'Max' },
  ];
  const statsData = { totalRows: 10, sum: 66, avg: 6, min: 1, max: 11 };

  it('renders all stats with correct labels and values', () => {
    render(<StatsDisplay statsConfig={statsConfig} statsData={statsData} />);
    statsConfig.forEach(stat => {
      // Find the span containing the label
      const labelSpan = screen.getByText(stat.label, { exact: false });
      // The value should be present somewhere in the same span
      expect(labelSpan.textContent).toMatch(new RegExp(`${stat.label}\\s*:\\s*${statsData[stat.key]}`));
    });
  });

  it('renders separators between stats except after the last one', () => {
    render(<StatsDisplay statsConfig={statsConfig} statsData={statsData} />);
    const separators = document.querySelectorAll('.separator');
    expect(separators.length).toBe(statsConfig.length - 1);
  });

  it('renders nothing if statsConfig is empty', () => {
    render(<StatsDisplay statsConfig={[]} statsData={statsData} />);
    expect(screen.queryByText(/:/)).not.toBeInTheDocument();
  });

  it('renders value as undefined if statsData does not contain the key', () => {
    render(<StatsDisplay statsConfig={[{ key: 'missing', label: 'Missing' }]} statsData={{}} />);
    const labelSpan = screen.getByText('Missing', { exact: false });
    expect(labelSpan.textContent).toMatch(/Missing\s*:\s*$/);
  });

  it('renders string values from statsData', () => {
    const stringStatsData = { ...statsData, custom: 'N/A' };
    render(<StatsDisplay statsConfig={[{ key: 'custom', label: 'Custom' }]} statsData={stringStatsData} />);
    const labelSpan = screen.getByText('Custom', { exact: false });
    expect(labelSpan.textContent).toMatch(/Custom\s*:\s*N\/A/);
  });
});