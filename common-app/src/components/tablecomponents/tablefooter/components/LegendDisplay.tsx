import React from 'react';

// Define the shape of a legend item
type LegendItem = { label: string; color: string };

// Props for the LegendDisplay component
type Props = { legendItems: LegendItem[] };

// Renders a list of legend items with color boxes
const LegendDisplay: React.FC<Props> = ({ legendItems }) => (
  <>
    {legendItems.map((item) => (
      // Each legend item displays a label and a color box
      <div className="label-box" key={item.label}>
        <span>{item.label}</span>
        <span
          className="color-box"
          style={{ backgroundColor: item.color }}
        />
      </div>
    ))}
  </>
);

export default LegendDisplay;