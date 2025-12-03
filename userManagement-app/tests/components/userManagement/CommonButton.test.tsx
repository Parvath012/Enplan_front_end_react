import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommonButton from '../../../src/components/userManagement/CommonButton';

describe('CommonButton', () => {
  describe('Component Rendering', () => {
    it('should render with default props', () => {
      render(<CommonButton>Click Me</CommonButton>);
      
      const button = screen.getByText('Click Me');
      expect(button).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <CommonButton>
          <span>Test Content</span>
        </CommonButton>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render with custom width', () => {
      const { container } = render(
        <CommonButton width="200px">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ width: '200px' });
    });

    it('should render with custom height', () => {
      const { container } = render(
        <CommonButton height="40px">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ height: '40px' });
    });

    it('should render with custom backgroundColor', () => {
      const { container } = render(
        <CommonButton backgroundColor="#FF0000">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ backgroundColor: '#FF0000' });
    });

    it('should render with custom borderRadius', () => {
      const { container } = render(
        <CommonButton borderRadius="8px">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ borderRadius: '8px' });
    });

    it('should render with all custom props', () => {
      const { container } = render(
        <CommonButton
          width="150px"
          height="30px"
          backgroundColor="#00FF00"
          hoverBackgroundColor="#00AA00"
          borderRadius="10px"
        >
          Custom Button
        </CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({
        width: '150px',
        height: '30px',
        backgroundColor: '#00FF00',
        borderRadius: '10px'
      });
    });
  });

  describe('Default Props', () => {
    it('should use default width when not provided', () => {
      const { container } = render(<CommonButton>Button</CommonButton>);
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ width: '113px' });
    });

    it('should use default height when not provided', () => {
      const { container } = render(<CommonButton>Button</CommonButton>);
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ height: '22px' });
    });

    it('should use default backgroundColor when not provided', () => {
      const { container } = render(<CommonButton>Button</CommonButton>);
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ backgroundColor: 'rgba(0, 111, 230, 1)' });
    });

    it('should use default borderRadius when not provided', () => {
      const { container } = render(<CommonButton>Button</CommonButton>);
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ borderRadius: '4px' });
    });
  });

  describe('Disabled State', () => {
    it('should render as disabled when disabled prop is true', () => {
      const { container } = render(
        <CommonButton disabled={true}>Disabled Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({
        backgroundColor: '#ccc',
        cursor: 'not-allowed'
      });
    });

    it('should not be disabled by default', () => {
      const { container } = render(<CommonButton>Button</CommonButton>);
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ cursor: 'pointer' });
      expect(button).not.toHaveStyle({ backgroundColor: '#ccc' });
    });

    it('should not call onClick when disabled', () => {
      const mockOnClick = jest.fn();
      
      render(
        <CommonButton onClick={mockOnClick} disabled={true}>
          Disabled Button
        </CommonButton>
      );
      
      const button = screen.getByText('Disabled Button');
      fireEvent.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should show disabled cursor when disabled', () => {
      const { container } = render(
        <CommonButton disabled={true}>Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ cursor: 'not-allowed' });
    });

    it('should show pointer cursor when not disabled', () => {
      const { container } = render(
        <CommonButton disabled={false}>Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', () => {
      const mockOnClick = jest.fn();
      
      render(
        <CommonButton onClick={mockOnClick}>Click Me</CommonButton>
      );
      
      const button = screen.getByText('Click Me');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times', () => {
      const mockOnClick = jest.fn();
      
      render(
        <CommonButton onClick={mockOnClick}>Click Me</CommonButton>
      );
      
      const button = screen.getByText('Click Me');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should work without onClick handler', () => {
      render(<CommonButton>Button</CommonButton>);
      
      const button = screen.getByText('Button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Hover Behavior', () => {
    it('should have hover styles defined', () => {
      const { container } = render(
        <CommonButton hoverBackgroundColor="#0051AB">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toBeInTheDocument();
    });

    it('should not apply hover styles when disabled', () => {
      const { container } = render(
        <CommonButton 
          disabled={true}
          hoverBackgroundColor="#0051AB"
        >
          Button
        </CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ backgroundColor: '#ccc' });
    });
  });

  describe('Layout and Styling', () => {
    it('should have flex display', () => {
      const { container } = render(<CommonButton>Button</CommonButton>);
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ display: 'flex' });
    });

    it('should center content with alignItems', () => {
      const { container } = render(<CommonButton>Button</CommonButton>);
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ alignItems: 'center' });
    });

    it('should center content with justifyContent', () => {
      const { container } = render(<CommonButton>Button</CommonButton>);
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ justifyContent: 'center' });
    });
  });

  describe('Children Rendering', () => {
    it('should render text children', () => {
      render(<CommonButton>Simple Text</CommonButton>);
      
      expect(screen.getByText('Simple Text')).toBeInTheDocument();
    });

    it('should render JSX children', () => {
      render(
        <CommonButton>
          <div data-testid="child-div">Child Element</div>
        </CommonButton>
      );
      
      expect(screen.getByTestId('child-div')).toBeInTheDocument();
      expect(screen.getByText('Child Element')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <CommonButton>
          <span>First</span>
          <span>Second</span>
        </CommonButton>
      );
      
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should render complex nested children', () => {
      render(
        <CommonButton>
          <div>
            <span>Nested</span>
            <strong>Content</strong>
          </div>
        </CommonButton>
      );
      
      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<CommonButton>{''}</CommonButton>);
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle null onClick', () => {
      render(<CommonButton onClick={undefined}>Button</CommonButton>);
      
      const button = screen.getByText('Button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should handle zero width', () => {
      const { container } = render(
        <CommonButton width="0px">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ width: '0px' });
    });

    it('should handle zero height', () => {
      const { container } = render(
        <CommonButton height="0px">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ height: '0px' });
    });

    it('should handle very large dimensions', () => {
      const { container } = render(
        <CommonButton width="1000px" height="500px">
          Large Button
        </CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({
        width: '1000px',
        height: '500px'
      });
    });
  });

  describe('Color Variations', () => {
    it('should handle hex colors', () => {
      const { container } = render(
        <CommonButton backgroundColor="#FF5733">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ backgroundColor: '#FF5733' });
    });

    it('should handle rgb colors', () => {
      const { container } = render(
        <CommonButton backgroundColor="rgb(255, 0, 0)">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
    });

    it('should handle rgba colors', () => {
      const { container } = render(
        <CommonButton backgroundColor="rgba(255, 0, 0, 0.5)">
          Button
        </CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ backgroundColor: 'rgba(255, 0, 0, 0.5)' });
    });

    it('should handle named colors', () => {
      const { container } = render(
        <CommonButton backgroundColor="red">Button</CommonButton>
      );
      
      const button = container.firstChild;
      expect(button).toHaveStyle({ backgroundColor: 'red' });
    });
  });
});

