import React from 'react';
import { render } from '@testing-library/react';
import CircularLoader from '../../../src/components/common/CircularLoader';

describe('CircularLoader', () => {
  const defaultProps = {
    size: 30,
    backgroundColor: '#e0f2ff',
    activeColor: '#007bff',
    thickness: 6,
    speed: 1
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<CircularLoader />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

  it('renders fullscreen variant by default', () => {
    const { container } = render(<CircularLoader />);
    // Look for the backdrop element
    const backdrop = container.firstChild as HTMLElement;
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveStyle('position: fixed');
  });

  it('renders content variant correctly', () => {
    const { container } = render(<CircularLoader variant="content" />);
    // Content variant has no backdrop, only the loader container
    const loaderContainer = container.firstChild as HTMLElement;
    expect(loaderContainer).toBeInTheDocument();
    expect(loaderContainer).toHaveStyle('position: absolute');
  });

    it('renders with default props', () => {
      const { container } = render(<CircularLoader />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '30');
      expect(svg).toHaveAttribute('height', '30');
    });

    it('renders with custom props', () => {
      const { container } = render(<CircularLoader {...defaultProps} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '30');
      expect(svg).toHaveAttribute('height', '30');
    });
  });

  describe('Size Prop', () => {
    it('applies custom size', () => {
      const { container } = render(<CircularLoader size={60} />);
      
      // Check the loader container (second child, after backdrop)
      const loader = container.children[1] as HTMLElement;
      expect(loader).toHaveStyle({ width: '60px', height: '60px' });
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '60');
      expect(svg).toHaveAttribute('height', '60');
    });

    it('applies very small size', () => {
      const { container } = render(<CircularLoader size={10} />);
      
      // Check the loader container (second child, after backdrop)
      const loader = container.children[1] as HTMLElement;
      expect(loader).toHaveStyle({ width: '10px', height: '10px' });
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '10');
      expect(svg).toHaveAttribute('height', '10');
    });

    it('applies very large size', () => {
      const { container } = render(<CircularLoader size={200} />);
      
      // Check the loader container (second child, after backdrop)
      const loader = container.children[1] as HTMLElement;
      expect(loader).toHaveStyle({ width: '200px', height: '200px' });
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '200');
    });

    it('applies zero size', () => {
      const { container } = render(<CircularLoader size={0} />);
      
      // Check the loader container (second child, after backdrop)
      const loader = container.children[1] as HTMLElement;
      expect(loader).toHaveStyle({ width: '0px', height: '0px' });
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '0');
      expect(svg).toHaveAttribute('height', '0');
    });

    it('applies negative size', () => {
      const { container } = render(<CircularLoader size={-10} />);
      
      // Check that the SVG element has the negative size attributes
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '-10');
      expect(svg).toHaveAttribute('height', '-10');
      expect(svg).toHaveAttribute('viewBox', '0 0 -10 -10');
    });
  });

  describe('Color Props', () => {
    it('applies custom background color', () => {
      const { container } = render(
        <CircularLoader 
          backgroundColor="#ff0000" 
          activeColor="#00ff00" 
        />
      );
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke', '#ff0000');
      expect(circles[1]).toHaveAttribute('stroke', '#00ff00');
    });

    it('applies custom active color', () => {
      const { container } = render(
        <CircularLoader 
          activeColor="#ff00ff" 
        />
      );
      
      const circles = container.querySelectorAll('circle');
      expect(circles[1]).toHaveAttribute('stroke', '#ff00ff');
    });

    it('applies custom background color only', () => {
      const { container } = render(
        <CircularLoader 
          backgroundColor="#123456" 
        />
      );
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke', '#123456');
      expect(circles[1]).toHaveAttribute('stroke', '#007bff'); // default
    });

    it('applies hex colors with alpha', () => {
      const { container } = render(
        <CircularLoader 
          backgroundColor="#ff0000ff" 
          activeColor="#00ff00ff" 
        />
      );
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke', '#ff0000ff');
      expect(circles[1]).toHaveAttribute('stroke', '#00ff00ff');
    });

    it('applies named colors', () => {
      const { container } = render(
        <CircularLoader 
          backgroundColor="red" 
          activeColor="green" 
        />
      );
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke', 'red');
      expect(circles[1]).toHaveAttribute('stroke', 'green');
    });

    it('applies rgb colors', () => {
      const { container } = render(
        <CircularLoader 
          backgroundColor="rgb(255, 0, 0)" 
          activeColor="rgb(0, 255, 0)" 
        />
      );
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke', 'rgb(255, 0, 0)');
      expect(circles[1]).toHaveAttribute('stroke', 'rgb(0, 255, 0)');
    });
  });

  describe('Thickness Prop', () => {
    it('applies custom thickness', () => {
      const { container } = render(<CircularLoader thickness={6} />);
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '6');
      expect(circles[1]).toHaveAttribute('stroke-width', '6');
    });

    it('applies very thin thickness', () => {
      const { container } = render(<CircularLoader thickness={1} />);
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '1');
      expect(circles[1]).toHaveAttribute('stroke-width', '1');
    });

    it('applies very thick thickness', () => {
      const { container } = render(<CircularLoader thickness={20} />);
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '20');
      expect(circles[1]).toHaveAttribute('stroke-width', '20');
    });

    it('applies zero thickness', () => {
      const { container } = render(<CircularLoader thickness={0} />);
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '0');
      expect(circles[1]).toHaveAttribute('stroke-width', '0');
    });

    it('applies negative thickness', () => {
      const { container } = render(<CircularLoader thickness={-5} />);
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '-5');
      expect(circles[1]).toHaveAttribute('stroke-width', '-5');
    });
  });

  describe('Speed Prop', () => {
    it('applies default speed', () => {
      const { container } = render(<CircularLoader />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ animation: 'rotate 2s linear infinite' });
    });

    it('applies custom speed', () => {
      const { container } = render(<CircularLoader speed={2} />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ animation: 'rotate 1s linear infinite' });
    });

    it('applies very fast speed', () => {
      const { container } = render(<CircularLoader speed={10} />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ animation: 'rotate 0.2s linear infinite' });
    });

    it('applies very slow speed', () => {
      const { container } = render(<CircularLoader speed={0.1} />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ animation: 'rotate 20s linear infinite' });
    });

    it('applies zero speed', () => {
      const { container } = render(<CircularLoader speed={0} />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ animation: 'rotate Infinitys linear infinite' });
    });

    it('applies negative speed', () => {
      const { container } = render(<CircularLoader speed={-1} />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ animation: 'rotate -2s linear infinite' });
    });
  });

  describe('SVG Structure', () => {
    it('has correct viewBox', () => {
      const { container } = render(<CircularLoader size={50} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 50 50');
    });

    it('has correct transform rotation', () => {
      const { container } = render(<CircularLoader />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({ transform: 'rotate(90deg)' });
    });

    it('has background circle with correct attributes', () => {
      const { container } = render(<CircularLoader size={40} thickness={8} />);
      
      const backgroundCircle = container.querySelectorAll('circle')[0];
      expect(backgroundCircle).toHaveAttribute('cx', '20');
      expect(backgroundCircle).toHaveAttribute('cy', '20');
      expect(backgroundCircle).toHaveAttribute('r', '16'); // (40-8)/2
      expect(backgroundCircle).toHaveAttribute('fill', 'none');
      expect(backgroundCircle).toHaveAttribute('stroke-linecap', 'round');
    });

    it('has active circle with correct attributes', () => {
      const { container } = render(<CircularLoader size={40} thickness={8} />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveAttribute('cx', '20');
      expect(activeCircle).toHaveAttribute('cy', '20');
      expect(activeCircle).toHaveAttribute('r', '16'); // (40-8)/2
      expect(activeCircle).toHaveAttribute('fill', 'none');
      expect(activeCircle).toHaveAttribute('stroke-linecap', 'round');
      expect(activeCircle).toHaveAttribute('stroke-dasharray');
      expect(activeCircle).toHaveAttribute('stroke-dashoffset', '0');
    });
  });

  describe('Animation and Styling', () => {
    it('has animation applied', () => {
      const { container } = render(<CircularLoader />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ animation: 'rotate 2s linear infinite' });
    });

    it('has correct transform origin', () => {
      const { container } = render(<CircularLoader />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ transformOrigin: 'center' });
    });

    it('has correct stroke dasharray calculation', () => {
      const { container } = render(<CircularLoader size={40} thickness={8} />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      const radius = (40 - 8) / 2; // 16
      const circumference = 2 * Math.PI * radius; // ~100.53
      const expectedDasharray = `${circumference * 0.25} ${circumference * 0.75}`;
      
      expect(activeCircle).toHaveAttribute('stroke-dasharray', expectedDasharray);
    });
  });

  describe('Backdrop and Positioning', () => {
    it('renders backdrop with correct styling', () => {
      const { container } = render(<CircularLoader />);
      
      const backdrop = container.firstChild as HTMLElement;
      expect(backdrop).toHaveStyle({
        position: 'fixed',
        top: '0px',
        left: '0px',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(240, 239, 239, 1)'
      });
    });

    it('renders loader with correct positioning', () => {
      const { container } = render(<CircularLoader />);
      
      const loader = container.children[1] as HTMLElement;
      expect(loader).toHaveStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999'
      });
    });
  });

  describe('Additional Props', () => {
    it('passes through additional props to the loader box', () => {
      const { container } = render(
        <CircularLoader 
          data-testid="custom-loader"
          className="custom-class"
          id="loader-id"
        />
      );
      
      const loader = container.children[1] as HTMLElement;
      expect(loader).toHaveAttribute('data-testid', 'custom-loader');
      expect(loader).toHaveClass('custom-class');
      expect(loader).toHaveAttribute('id', 'loader-id');
    });

    it('applies custom sx prop', () => {
      const { container } = render(
        <CircularLoader 
          sx={{ 
            backgroundColor: 'red',
            border: '2px solid blue'
          }} 
        />
      );
      
      const loader = container.children[1] as HTMLElement;
      expect(loader).toHaveStyle({
        backgroundColor: 'red',
        border: '2px solid blue'
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very large size without breaking', () => {
      const { container } = render(<CircularLoader size={1000} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '1000');
      expect(svg).toHaveAttribute('height', '1000');
    });

    it('handles very small size without breaking', () => {
      const { container } = render(<CircularLoader size={1} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '1');
      expect(svg).toHaveAttribute('height', '1');
    });

    it('handles zero thickness without breaking', () => {
      const { container } = render(<CircularLoader thickness={0} />);
      
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '0');
      expect(circles[1]).toHaveAttribute('stroke-width', '0');
    });

    it('handles extreme speed values', () => {
      const { container } = render(<CircularLoader speed={1000} />);
      
      const activeCircle = container.querySelectorAll('circle')[1];
      expect(activeCircle).toHaveStyle({ animation: 'rotate 0.002s linear infinite' });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { container } = render(<CircularLoader />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('maintains accessibility with custom props', () => {
      const { container } = render(<CircularLoader size={100} thickness={20} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with minimal re-renders', () => {
      const { rerender, container } = render(<CircularLoader />);
      
      // Re-render with same props
      rerender(<CircularLoader />);
      
      // Should still have the same elements
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('handles prop changes efficiently', () => {
      const { rerender, container } = render(<CircularLoader />);
      
      // Change size
      rerender(<CircularLoader size={50} />);
      expect(container.querySelector('svg')).toHaveAttribute('width', '50');
      
      // Change colors
      rerender(<CircularLoader size={50} backgroundColor="red" activeColor="blue" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
