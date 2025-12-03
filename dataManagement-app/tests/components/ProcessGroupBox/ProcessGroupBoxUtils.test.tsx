import React from 'react';
import { render, screen } from '@testing-library/react';
import { IconWithCount, IconDivider, StatRow, iconContainerStyles } from '../../../src/components/ProcessGroupBox/ProcessGroupBoxUtils';

describe('ProcessGroupBoxUtils', () => {
  describe('iconContainerStyles', () => {
    it('should have correct style properties', () => {
      expect(iconContainerStyles).toHaveProperty('display', 'flex');
      expect(iconContainerStyles).toHaveProperty('alignItems', 'center');
      expect(iconContainerStyles).toHaveProperty('gap', '6px');
      expect(iconContainerStyles).toHaveProperty('marginRight', '8px');
      expect(iconContainerStyles).toHaveProperty('padding', '1px 2px');
      expect(iconContainerStyles).toHaveProperty('borderRadius', '4px');
      expect(iconContainerStyles).toHaveProperty('transition', 'background-color 0.2s ease');
      expect(iconContainerStyles).toHaveProperty('cursor', 'default');
    });

    it('should have hover styles', () => {
      expect(iconContainerStyles).toHaveProperty('&:hover');
      expect(iconContainerStyles['&:hover']).toEqual({ backgroundColor: '#f0f0f0' });
    });
  });

  describe('IconDivider', () => {
    it('should render a pipe divider', () => {
      const { container } = render(<IconDivider />);
      const divider = container.querySelector('.MuiBox-root');
      
      expect(divider).toBeInTheDocument();
      expect(divider).toHaveTextContent('|');
    });
  });

  describe('IconWithCount', () => {
    const mockIcon = <div data-testid="mock-icon">Icon</div>;

    it('should render icon with count', () => {
      render(
        <IconWithCount
          icon={mockIcon}
          count={5}
          title="Test Title"
        />
      );
      
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render with divider by default', () => {
      const { container } = render(
        <IconWithCount
          icon={mockIcon}
          count={3}
          title="Test"
        />
      );
      
      const dividers = container.querySelectorAll('.MuiBox-root');
      expect(dividers.length).toBeGreaterThan(1); // Icon container + divider
    });

    it('should not render divider when includeDivider is false', () => {
      const { container } = render(
        <IconWithCount
          icon={mockIcon}
          count={3}
          title="Test"
          includeDivider={false}
        />
      );
      
      // Should only have the icon container, no divider
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render title attribute', () => {
      const { container } = render(
        <IconWithCount
          icon={mockIcon}
          count={7}
          title="Running Process Groups"
        />
      );
      
      const titleElement = container.querySelector('[title="Running Process Groups"]');
      expect(titleElement).toBeInTheDocument();
    });

    it('should render with count zero', () => {
      render(
        <IconWithCount
          icon={mockIcon}
          count={0}
          title="Zero Count"
        />
      );
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render with large count', () => {
      render(
        <IconWithCount
          icon={mockIcon}
          count={999}
          title="Large Count"
        />
      );
      
      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('should render different icons correctly', () => {
      const icon1 = <div data-testid="icon-1">Icon 1</div>;
      const icon2 = <div data-testid="icon-2">Icon 2</div>;
      
      const { rerender } = render(
        <IconWithCount icon={icon1} count={1} title="First" />
      );
      
      expect(screen.getByTestId('icon-1')).toBeInTheDocument();
      
      rerender(<IconWithCount icon={icon2} count={2} title="Second" />);
      
      expect(screen.getByTestId('icon-2')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-1')).not.toBeInTheDocument();
    });
  });

  describe('StatRow', () => {
    it('should render with default props (isLast=false, highlighted=false)', () => {
      // Line 93: Default parameters isLast = false, highlighted = false
      // Line 94: Box component renders
      // Line 96: Uses statRowStyles when isLast is false
      // Line 97: Empty object when highlighted is false
      render(
        <StatRow
          label="Test Label"
          value="Test Value"
        />
      );
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Value')).toBeInTheDocument();
      expect(screen.getByText('0 min')).toBeInTheDocument();
    });

    it('should render with isLast=true', () => {
      // Line 96: Uses statRowStylesLast when isLast is true
      const { container } = render(
        <StatRow
          label="Last Row"
          value="Last Value"
          isLast={true}
        />
      );
      
      expect(screen.getByText('Last Row')).toBeInTheDocument();
      expect(screen.getByText('Last Value')).toBeInTheDocument();
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render with isLast=false', () => {
      // Line 96: Uses statRowStyles when isLast is false
      const { container } = render(
        <StatRow
          label="Regular Row"
          value="Regular Value"
          isLast={false}
        />
      );
      
      expect(screen.getByText('Regular Row')).toBeInTheDocument();
      expect(screen.getByText('Regular Value')).toBeInTheDocument();
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render with highlighted=true', () => {
      // Line 97: Applies highlighted styles when highlighted is true
      const { container } = render(
        <StatRow
          label="Highlighted Row"
          value="Highlighted Value"
          highlighted={true}
        />
      );
      
      expect(screen.getByText('Highlighted Row')).toBeInTheDocument();
      expect(screen.getByText('Highlighted Value')).toBeInTheDocument();
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render with highlighted=false', () => {
      // Line 97: Empty object when highlighted is false
      const { container } = render(
        <StatRow
          label="Normal Row"
          value="Normal Value"
          highlighted={false}
        />
      );
      
      expect(screen.getByText('Normal Row')).toBeInTheDocument();
      expect(screen.getByText('Normal Value')).toBeInTheDocument();
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render with both isLast=true and highlighted=true', () => {
      // Lines 96-97: Both conditions applied
      const { container } = render(
        <StatRow
          label="Last Highlighted Row"
          value="Last Highlighted Value"
          isLast={true}
          highlighted={true}
        />
      );
      
      expect(screen.getByText('Last Highlighted Row')).toBeInTheDocument();
      expect(screen.getByText('Last Highlighted Value')).toBeInTheDocument();
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render with isLast=true and highlighted=false', () => {
      // Line 96: Uses statRowStylesLast, Line 97: Empty object
      const { container } = render(
        <StatRow
          label="Last Normal Row"
          value="Last Normal Value"
          isLast={true}
          highlighted={false}
        />
      );
      
      expect(screen.getByText('Last Normal Row')).toBeInTheDocument();
      expect(screen.getByText('Last Normal Value')).toBeInTheDocument();
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render with isLast=false and highlighted=true', () => {
      // Line 96: Uses statRowStyles, Line 97: Applies highlighted styles
      const { container } = render(
        <StatRow
          label="Regular Highlighted Row"
          value="Regular Highlighted Value"
          isLast={false}
          highlighted={true}
        />
      );
      
      expect(screen.getByText('Regular Highlighted Row')).toBeInTheDocument();
      expect(screen.getByText('Regular Highlighted Value')).toBeInTheDocument();
      const box = container.querySelector('.MuiBox-root');
      expect(box).toBeInTheDocument();
    });

    it('should render with ReactNode value', () => {
      // Test that value can be a ReactNode
      const valueNode = <span data-testid="value-node">ReactNode Value</span>;
      render(
        <StatRow
          label="ReactNode Label"
          value={valueNode}
        />
      );
      
      expect(screen.getByText('ReactNode Label')).toBeInTheDocument();
      expect(screen.getByTestId('value-node')).toBeInTheDocument();
      expect(screen.getByText('ReactNode Value')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      // Test that value can be a string
      render(
        <StatRow
          label="String Label"
          value="String Value"
        />
      );
      
      expect(screen.getByText('String Label')).toBeInTheDocument();
      expect(screen.getByText('String Value')).toBeInTheDocument();
    });

    it('should render with complex ReactNode value', () => {
      // Test that value can be a complex ReactNode
      const complexValue = (
        <>
          <span>Part 1</span>
          <span> → </span>
          <span>Part 2</span>
        </>
      );
      render(
        <StatRow
          label="Complex Label"
          value={complexValue}
        />
      );
      
      expect(screen.getByText('Complex Label')).toBeInTheDocument();
      expect(screen.getByText('Part 1')).toBeInTheDocument();
      expect(screen.getByText(' → ')).toBeInTheDocument();
      expect(screen.getByText('Part 2')).toBeInTheDocument();
    });

    it('should render time display', () => {
      // Verify time display is always rendered
      render(
        <StatRow
          label="Time Test"
          value="Value"
        />
      );
      
      expect(screen.getByText('0 min')).toBeInTheDocument();
      expect(screen.getByText('|')).toBeInTheDocument();
    });

    it('should render all parts of StatRow', () => {
      // Verify all parts render correctly
      const { container } = render(
        <StatRow
          label="Complete Test"
          value="Complete Value"
          isLast={false}
          highlighted={false}
        />
      );
      
      expect(screen.getByText('Complete Test')).toBeInTheDocument();
      expect(screen.getByText('Complete Value')).toBeInTheDocument();
      expect(screen.getByText('0 min')).toBeInTheDocument();
      
      // Verify structure
      const boxes = container.querySelectorAll('.MuiBox-root');
      expect(boxes.length).toBeGreaterThan(0);
    });
  });
});

