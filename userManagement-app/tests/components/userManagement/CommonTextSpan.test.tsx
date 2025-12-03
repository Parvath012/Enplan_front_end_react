import React from 'react';
import { render, screen } from '@testing-library/react';
import CommonTextSpan from '../../../src/components/userManagement/CommonTextSpan';

describe('CommonTextSpan', () => {
  describe('Component Rendering', () => {
    it('should render with default props', () => {
      render(<CommonTextSpan>Test Text</CommonTextSpan>);
      
      expect(screen.getByText('Test Text')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(<CommonTextSpan>Hello World</CommonTextSpan>);
      
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render with custom fontFamily', () => {
      const { container } = render(
        <CommonTextSpan fontFamily="Arial, sans-serif">
          Custom Font
        </CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontFamily: 'Arial, sans-serif' });
    });

    it('should render with custom fontWeight', () => {
      const { container } = render(
        <CommonTextSpan fontWeight={700}>Bold Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 700 });
    });

    it('should render with custom fontSize', () => {
      const { container } = render(
        <CommonTextSpan fontSize="18px">Large Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '18px' });
    });

    it('should render with custom color', () => {
      const { container } = render(
        <CommonTextSpan color="#FF0000">Red Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ color: '#FF0000' });
    });

    it('should render with custom textAlign', () => {
      const { container } = render(
        <CommonTextSpan textAlign="center">Centered Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ textAlign: 'center' });
    });

    it('should render with custom lineHeight', () => {
      const { container } = render(
        <CommonTextSpan lineHeight="24px">Text with Line Height</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ lineHeight: '24px' });
    });

    it('should render with all custom props', () => {
      const { container } = render(
        <CommonTextSpan
          fontFamily="Helvetica, sans-serif"
          fontWeight={600}
          fontSize="16px"
          color="#00FF00"
          textAlign="right"
          lineHeight="22px"
        >
          Fully Customized
        </CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 600,
        fontSize: '16px',
        color: '#00FF00',
        textAlign: 'right',
        lineHeight: '22px'
      });
    });
  });

  describe('Default Props', () => {
    it('should use default fontFamily when not provided', () => {
      const { container } = render(<CommonTextSpan>Text</CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({
        fontFamily: "'Inter18pt-Medium', 'Inter 18pt Medium', 'Inter 18pt', sans-serif"
      });
    });

    it('should use default fontWeight when not provided', () => {
      const { container } = render(<CommonTextSpan>Text</CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 500 });
    });

    it('should use default fontSize when not provided', () => {
      const { container } = render(<CommonTextSpan>Text</CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '14px' });
    });

    it('should use default color when not provided', () => {
      const { container } = render(<CommonTextSpan>Text</CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ color: '#D0F0FF' });
    });

    it('should use default textAlign when not provided', () => {
      const { container } = render(<CommonTextSpan>Text</CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ textAlign: 'left' });
    });

    it('should use default lineHeight when not provided', () => {
      const { container } = render(<CommonTextSpan>Text</CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ lineHeight: '20px' });
    });

    it('should have fontStyle normal by default', () => {
      const { container } = render(<CommonTextSpan>Text</CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontStyle: 'normal' });
    });
  });

  describe('Text Alignment Options', () => {
    it('should render with left alignment', () => {
      const { container } = render(
        <CommonTextSpan textAlign="left">Left Aligned</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ textAlign: 'left' });
    });

    it('should render with center alignment', () => {
      const { container } = render(
        <CommonTextSpan textAlign="center">Center Aligned</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ textAlign: 'center' });
    });

    it('should render with right alignment', () => {
      const { container } = render(
        <CommonTextSpan textAlign="right">Right Aligned</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ textAlign: 'right' });
    });
  });

  describe('Font Weight Variations', () => {
    it('should render with light font weight', () => {
      const { container } = render(
        <CommonTextSpan fontWeight={300}>Light Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 300 });
    });

    it('should render with normal font weight', () => {
      const { container } = render(
        <CommonTextSpan fontWeight={400}>Normal Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 400 });
    });

    it('should render with medium font weight', () => {
      const { container } = render(
        <CommonTextSpan fontWeight={500}>Medium Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 500 });
    });

    it('should render with semi-bold font weight', () => {
      const { container } = render(
        <CommonTextSpan fontWeight={600}>Semi-Bold Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 600 });
    });

    it('should render with bold font weight', () => {
      const { container } = render(
        <CommonTextSpan fontWeight={700}>Bold Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 700 });
    });
  });

  describe('Font Size Variations', () => {
    it('should render with small font size', () => {
      const { container } = render(
        <CommonTextSpan fontSize="10px">Small Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '10px' });
    });

    it('should render with medium font size', () => {
      const { container } = render(
        <CommonTextSpan fontSize="14px">Medium Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '14px' });
    });

    it('should render with large font size', () => {
      const { container } = render(
        <CommonTextSpan fontSize="20px">Large Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '20px' });
    });

    it('should handle rem units', () => {
      const { container } = render(
        <CommonTextSpan fontSize="1.5rem">Rem Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '1.5rem' });
    });

    it('should handle em units', () => {
      const { container } = render(
        <CommonTextSpan fontSize="1.2em">Em Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '1.2em' });
    });
  });

  describe('Color Variations', () => {
    it('should handle hex colors', () => {
      const { container } = render(
        <CommonTextSpan color="#FF5733">Hex Color</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ color: '#FF5733' });
    });

    it('should handle rgb colors', () => {
      const { container } = render(
        <CommonTextSpan color="rgb(255, 0, 0)">RGB Color</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });

    it('should handle rgba colors', () => {
      const { container } = render(
        <CommonTextSpan color="rgba(255, 0, 0, 0.5)">RGBA Color</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ color: 'rgba(255, 0, 0, 0.5)' });
    });

    it('should handle named colors', () => {
      const { container } = render(
        <CommonTextSpan color="blue">Named Color</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ color: 'blue' });
    });
  });

  describe('Children Rendering', () => {
    it('should render text children', () => {
      render(<CommonTextSpan>Simple Text</CommonTextSpan>);
      
      expect(screen.getByText('Simple Text')).toBeInTheDocument();
    });

    it('should render JSX children', () => {
      render(
        <CommonTextSpan>
          <strong>Bold Content</strong>
        </CommonTextSpan>
      );
      
      expect(screen.getByText('Bold Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <CommonTextSpan>
          First <em>Second</em>
        </CommonTextSpan>
      );
      
      expect(screen.getByText(/First/)).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('should render numbers', () => {
      render(<CommonTextSpan>{123}</CommonTextSpan>);
      
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should render complex nested children', () => {
      render(
        <CommonTextSpan>
          <div>
            <span>Nested</span>
            <strong>Content</strong>
          </div>
        </CommonTextSpan>
      );
      
      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string children', () => {
      const { container } = render(<CommonTextSpan>{''}</CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toBeEmptyDOMElement();
    });

    it('should handle whitespace children', () => {
      const { container } = render(<CommonTextSpan>   </CommonTextSpan>);
      
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span?.textContent).toBe('   ');
    });

    it('should handle zero font weight', () => {
      const { container } = render(
        <CommonTextSpan fontWeight={0}>Zero Weight</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 0 });
    });

    it('should handle very large font weight', () => {
      const { container } = render(
        <CommonTextSpan fontWeight={900}>Heavy Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontWeight: 900 });
    });

    it('should handle very small font size', () => {
      const { container } = render(
        <CommonTextSpan fontSize="1px">Tiny Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '1px' });
    });

    it('should handle very large font size', () => {
      const { container } = render(
        <CommonTextSpan fontSize="100px">Huge Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontSize: '100px' });
    });
  });

  describe('Line Height Variations', () => {
    it('should handle numeric line height', () => {
      const { container } = render(
        <CommonTextSpan lineHeight="1.5">Line Height</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ lineHeight: '1.5' });
    });

    it('should handle pixel line height', () => {
      const { container } = render(
        <CommonTextSpan lineHeight="24px">Line Height</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ lineHeight: '24px' });
    });

    it('should handle rem line height', () => {
      const { container } = render(
        <CommonTextSpan lineHeight="1.5rem">Line Height</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ lineHeight: '1.5rem' });
    });
  });

  describe('Font Family Variations', () => {
    it('should handle single font family', () => {
      const { container } = render(
        <CommonTextSpan fontFamily="Arial">Arial Text</CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontFamily: 'Arial' });
    });

    it('should handle font family with fallbacks', () => {
      const { container } = render(
        <CommonTextSpan fontFamily="Arial, Helvetica, sans-serif">
          Fallback Fonts
        </CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontFamily: 'Arial, Helvetica, sans-serif' });
    });

    it('should handle font family with quotes', () => {
      const { container } = render(
        <CommonTextSpan fontFamily="'Times New Roman', serif">
          Quoted Font
        </CommonTextSpan>
      );
      
      const span = container.querySelector('span');
      expect(span).toHaveStyle({ fontFamily: "'Times New Roman', serif" });
    });
  });
});

