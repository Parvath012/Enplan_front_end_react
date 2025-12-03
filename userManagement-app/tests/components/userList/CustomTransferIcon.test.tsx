import React from 'react';
import { render } from '@testing-library/react';
import CustomTransferIcon from '../../../src/components/userList/CustomTransferIcon';

describe('CustomTransferIcon', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render as SVG element', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg?.tagName).toBe('svg');
    });

    it('should have correct namespace', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    it('should have fill attribute set to none', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should have correct viewBox', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    });
  });

  describe('Default Props', () => {
    it('should use default size of 16', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    it('should use default color of #5B6061', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', '#5B6061');
      });
    });

    it('should use default color for polygon', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const polygon = container.querySelector('polygon');
      expect(polygon).toHaveAttribute('fill', '#5B6061');
    });
  });

  describe('Custom Size', () => {
    it('should render with custom size of 20', () => {
      const { container } = render(<CustomTransferIcon size={20} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('height', '20');
    });

    it('should render with custom size of 24', () => {
      const { container } = render(<CustomTransferIcon size={24} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('should render with custom size of 32', () => {
      const { container } = render(<CustomTransferIcon size={32} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should render with very small size', () => {
      const { container } = render(<CustomTransferIcon size={8} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '8');
      expect(svg).toHaveAttribute('height', '8');
    });

    it('should render with very large size', () => {
      const { container } = render(<CustomTransferIcon size={64} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '64');
      expect(svg).toHaveAttribute('height', '64');
    });
  });

  describe('Custom Color', () => {
    it('should render with custom color #FF0000', () => {
      const { container } = render(<CustomTransferIcon color="#FF0000" />);
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', '#FF0000');
      });
    });

    it('should render with custom color #00FF00', () => {
      const { container } = render(<CustomTransferIcon color="#00FF00" />);
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', '#00FF00');
      });
    });

    it('should render with custom color #0000FF', () => {
      const { container } = render(<CustomTransferIcon color="#0000FF" />);
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', '#0000FF');
      });
    });

    it('should apply color to polygon element', () => {
      const { container } = render(<CustomTransferIcon color="#FF5733" />);
      
      const polygon = container.querySelector('polygon');
      expect(polygon).toHaveAttribute('fill', '#FF5733');
    });

    it('should render with rgb color', () => {
      const { container } = render(<CustomTransferIcon color="rgb(255, 0, 0)" />);
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', 'rgb(255, 0, 0)');
      });
    });

    it('should render with rgba color', () => {
      const { container } = render(<CustomTransferIcon color="rgba(255, 0, 0, 0.5)" />);
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', 'rgba(255, 0, 0, 0.5)');
      });
    });

    it('should render with named color', () => {
      const { container } = render(<CustomTransferIcon color="red" />);
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', 'red');
      });
    });
  });

  describe('Custom Size and Color', () => {
    it('should render with both custom size and color', () => {
      const { container } = render(
        <CustomTransferIcon size={24} color="#FF5733" />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', '#FF5733');
      });
    });

    it('should render with size 32 and custom color', () => {
      const { container } = render(
        <CustomTransferIcon size={32} color="#00AA00" />
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', '#00AA00');
      });
    });
  });

  describe('SVG Structure', () => {
    it('should contain 5 path elements', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const paths = container.querySelectorAll('path');
      expect(paths).toHaveLength(5);
    });

    it('should contain 1 polygon element', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const polygon = container.querySelector('polygon');
      expect(polygon).toBeInTheDocument();
    });

    it('should have correct path d attributes', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const paths = container.querySelectorAll('path');
      expect(paths[0]).toHaveAttribute('d', 'M27,25h-6c-1.7,0-3,1.3-3,3v2h2v-2c0-.6.4-1,1-1h6c.6,0,1,.4,1,1v2h2v-2c0-1.7-1.3-3-3-3Z');
      expect(paths[1]).toHaveAttribute('d', 'M20,20c0,2.2,1.8,4,4,4s4-1.8,4-4-1.8-4-4-4-4,1.8-4,4ZM26,20c0,1.1-.9,2-2,2s-2-.9-2-2,.9-2,2-2,2,.9,2,2Z');
      expect(paths[2]).toHaveAttribute('d', 'M6,21v-1h-2v1c0,3.9,3.1,7,7,7h3v-2h-3c-2.8,0-5-2.2-5-5Z');
      expect(paths[3]).toHaveAttribute('d', 'M11,11h-6c-1.7,0-3,1.3-3,3v2h2v-2c0-.6.4-1,1-1h6c.6,0,1,.4,1,1v2h2v-2c0-1.7-1.3-3-3-3Z');
      expect(paths[4]).toHaveAttribute('d', 'M8,10c2.2,0,4-1.8,4-4s-1.8-4-4-4-4,1.8-4,4,1.8,4,4,4ZM8,4c1.1,0,2,.9,2,2s-.9,2-2,2-2-.9-2-2,.9-2,2-2Z');
    });

    it('should have correct polygon points attribute', () => {
      const { container } = render(<CustomTransferIcon />);
      
      const polygon = container.querySelector('polygon');
      expect(polygon).toHaveAttribute('points', '29 4.41 27.59 3 24 6.59 20.41 3 19 4.41 22.59 8 19 11.59 20.41 13 24 9.41 27.59 13 29 11.59 25.41 8 29 4.41');
    });
  });

  describe('Edge Cases', () => {
    it('should handle size of 0', () => {
      const { container } = render(<CustomTransferIcon size={0} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '0');
      expect(svg).toHaveAttribute('height', '0');
    });

    it('should handle negative size (renders as is)', () => {
      const { container } = render(<CustomTransferIcon size={-10} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '-10');
      expect(svg).toHaveAttribute('height', '-10');
    });

    it('should handle empty string color', () => {
      const { container } = render(<CustomTransferIcon color="" />);
      
      const paths = container.querySelectorAll('path');
      paths.forEach(path => {
        expect(path).toHaveAttribute('fill', '');
      });
    });

    it('should handle decimal size', () => {
      const { container } = render(<CustomTransferIcon size={16.5} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16.5');
      expect(svg).toHaveAttribute('height', '16.5');
    });
  });

  describe('Accessibility', () => {
    it('should be renderable in different contexts', () => {
      const { container } = render(
        <div>
          <CustomTransferIcon />
        </div>
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should maintain aspect ratio with viewBox', () => {
      const { container } = render(<CustomTransferIcon size={48} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple instances with different props', () => {
      const { container } = render(
        <div>
          <CustomTransferIcon size={16} color="#FF0000" />
          <CustomTransferIcon size={24} color="#00FF00" />
          <CustomTransferIcon size={32} color="#0000FF" />
        </div>
      );
      
      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(3);
      
      expect(svgs[0]).toHaveAttribute('width', '16');
      expect(svgs[1]).toHaveAttribute('width', '24');
      expect(svgs[2]).toHaveAttribute('width', '32');
    });

    it('should render multiple instances with same props', () => {
      const { container } = render(
        <div>
          <CustomTransferIcon />
          <CustomTransferIcon />
          <CustomTransferIcon />
        </div>
      );
      
      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(3);
      
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('width', '16');
        expect(svg).toHaveAttribute('height', '16');
      });
    });
  });

  describe('Visual Representation', () => {
    it('should represent a transfer icon with X mark', () => {
      const { container } = render(<CustomTransferIcon />);
      
      // The icon should have a polygon representing the X mark
      const polygon = container.querySelector('polygon');
      expect(polygon).toBeInTheDocument();
      
      // And multiple paths representing user figures
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should have consistent structure across renders', () => {
      const { container: container1 } = render(<CustomTransferIcon />);
      const { container: container2 } = render(<CustomTransferIcon />);
      
      const paths1 = container1.querySelectorAll('path');
      const paths2 = container2.querySelectorAll('path');
      
      expect(paths1).toHaveLength(paths2.length);
    });
  });
});

