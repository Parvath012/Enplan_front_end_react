import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormFieldWithTooltip from '../../../src/components/ProcessGroupBox/FormFieldWithTooltip';

// Mock TOOLTIP_CONFIG
jest.mock('../../../src/constants/tooltipStyles', () => ({
  TOOLTIP_CONFIG: {
    slotProps: {
      tooltip: {
        sx: {
          fontSize: '12px'
        }
      }
    }
  }
}));

describe('FormFieldWithTooltip', () => {
  const defaultProps = {
    htmlFor: 'test-field',
    label: 'Test Label',
    tooltipTitle: 'Tooltip information',
    children: <input id="test-field" />
  };

  it('should render label with tooltip', () => {
    render(<FormFieldWithTooltip {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(<FormFieldWithTooltip {...defaultProps} />);
    
    const input = screen.getByLabelText('Test Label');
    expect(input).toBeInTheDocument();
  });

  it('should have correct htmlFor attribute', () => {
    render(<FormFieldWithTooltip {...defaultProps} />);
    
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-field');
  });

  it('should render tooltip icon', () => {
    const { container } = render(<FormFieldWithTooltip {...defaultProps} />);
    
    // Check for SVG icon (InformationFilled)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should apply correct margin bottom to container', () => {
    const { container } = render(<FormFieldWithTooltip {...defaultProps} />);
    
    const box = container.firstChild as HTMLElement;
    expect(box).toHaveStyle({ marginBottom: '24px' });
  });
});

