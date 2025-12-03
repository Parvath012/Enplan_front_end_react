import React from 'react';
import { render, screen } from '@testing-library/react';
import LegendDisplay from '../../../../../src/components/tablecomponents/tablefooter/components/LegendDisplay';

describe('LegendDisplay', () => {
  const legendItems = [
    { label: 'Active', color: 'green' },
    { label: 'Inactive', color: 'red' },
    { label: 'Pending', color: '#ff0' },
  ];

  it('renders all legend items with correct labels', () => {
    render(<LegendDisplay legendItems={legendItems} />);
    legendItems.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('renders correct color for each legend item', () => {
    render(<LegendDisplay legendItems={legendItems} />);
    legendItems.forEach(item => {
      const labelBox = screen.getByText(item.label).closest('.label-box');
      const colorBox = labelBox?.querySelector('.color-box');
      expect(colorBox).toHaveStyle(`background-color: ${item.color}`);
    });
  });

  it('renders correct number of label-box elements', () => {
    render(<LegendDisplay legendItems={legendItems} />);
    expect(document.querySelectorAll('.label-box')).toHaveLength(legendItems.length);
  });

  it('renders nothing if legendItems is empty', () => {
    render(<LegendDisplay legendItems={[]} />);
    expect(document.querySelectorAll('.label-box')).toHaveLength(0);
  });

  it('uses label as key for each legend item', () => {
    // This test is mostly for coverage, as React uses the key internally.
    // We can check that rendering with duplicate labels causes a warning.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<LegendDisplay legendItems={[{ label: 'Dup', color: 'blue' }, { label: 'Dup', color: 'red' }]} />);
    expect(console.error).toHaveBeenCalled();
    spy.mockRestore();
  });
});