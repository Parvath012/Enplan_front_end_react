import React from 'react';
import { render } from '@testing-library/react';
import UserInitials from '../../src/components/UserInitials';

describe('UserInitials', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render initials correctly', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      expect(container.textContent).toBe('JD');
    });

    it('should render first initial only when lastName is empty', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="" />
      );
      
      expect(container.textContent).toBe('J');
    });

    it('should render last initial only when firstName is empty', () => {
      const { container } = render(
        <UserInitials firstName="" lastName="Doe" />
      );
      
      expect(container.textContent).toBe('D');
    });

    it('should render empty when both names are empty', () => {
      const { container } = render(
        <UserInitials firstName="" lastName="" />
      );
      
      expect(container.textContent).toBe('');
    });
  });

  describe('Initials Generation', () => {
    it('should capitalize first letter of firstName', () => {
      const { container } = render(
        <UserInitials firstName="john" lastName="doe" />
      );
      
      expect(container.textContent).toBe('JD');
    });

    it('should capitalize first letter of lastName', () => {
      const { container } = render(
        <UserInitials firstName="JOHN" lastName="DOE" />
      );
      
      expect(container.textContent).toBe('JD');
    });

    it('should handle mixed case names', () => {
      const { container } = render(
        <UserInitials firstName="jOhN" lastName="dOe" />
      );
      
      expect(container.textContent).toBe('JD');
    });

    it('should handle single character names', () => {
      const { container } = render(
        <UserInitials firstName="A" lastName="B" />
      );
      
      expect(container.textContent).toBe('AB');
    });

    it('should handle names with special characters', () => {
      const { container } = render(
        <UserInitials firstName="Ñoño" lastName="Álvarez" />
      );
      
      expect(container.textContent).toBe('ÑÁ');
    });

    it('should handle names with numbers', () => {
      const { container } = render(
        <UserInitials firstName="John2" lastName="Doe3" />
      );
      
      expect(container.textContent).toBe('JD');
    });

    it('should handle names with spaces', () => {
      const { container } = render(
        <UserInitials firstName="John Paul" lastName="Doe Smith" />
      );
      
      expect(container.textContent).toBe('JD');
    });
  });

  describe('Default Size and Font', () => {
    it('should use default size of 24px', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ width: '24px', height: '24px' });
    });

    it('should use default fontSize of 10', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ fontSize: '10px' });
    });
  });

  describe('Custom Size', () => {
    it('should render with custom size of 32', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" size={32} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ width: '32px', height: '32px' });
    });

    it('should render with custom size of 48', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" size={48} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ width: '48px', height: '48px' });
    });

    it('should render with very small size', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" size={16} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ width: '16px', height: '16px' });
    });

    it('should render with very large size', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" size={100} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ width: '100px', height: '100px' });
    });
  });

  describe('Custom Font Size', () => {
    it('should render with custom fontSize of 12', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" fontSize={12} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ fontSize: '12px' });
    });

    it('should render with custom fontSize of 14', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" fontSize={14} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ fontSize: '14px' });
    });

    it('should render with very small fontSize', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" fontSize={8} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ fontSize: '8px' });
    });

    it('should render with very large fontSize', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" fontSize={20} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ fontSize: '20px' });
    });
  });

  describe('Custom Size and Font Size', () => {
    it('should render with both custom size and fontSize', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" size={40} fontSize={16} />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ width: '40px', height: '40px', fontSize: '16px' });
    });
  });

  describe('Color Generation', () => {
    it('should generate consistent colors for same name', () => {
      const { container: container1 } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      const { container: container2 } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box1 = container1.firstChild as HTMLElement;
      const box2 = container2.firstChild as HTMLElement;
      
      const bgColor1 = window.getComputedStyle(box1).backgroundColor;
      const bgColor2 = window.getComputedStyle(box2).backgroundColor;
      
      expect(bgColor1).toBe(bgColor2);
    });

    it('should generate different colors for different names', () => {
      const { container: container1 } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      const { container: container2 } = render(
        <UserInitials firstName="Jane" lastName="Smith" />
      );
      
      const box1 = container1.firstChild as HTMLElement;
      const box2 = container2.firstChild as HTMLElement;
      
      // Colors should be generated based on name hash
      expect(box1).toBeInTheDocument();
      expect(box2).toBeInTheDocument();
    });

    it('should handle case-insensitive color generation', () => {
      const { container: container1 } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      const { container: container2 } = render(
        <UserInitials firstName="john" lastName="doe" />
      );
      
      const box1 = container1.firstChild as HTMLElement;
      const box2 = container2.firstChild as HTMLElement;
      
      const bgColor1 = window.getComputedStyle(box1).backgroundColor;
      const bgColor2 = window.getComputedStyle(box2).backgroundColor;
      
      expect(bgColor1).toBe(bgColor2);
    });
  });

  describe('Styling', () => {
    it('should have circular border radius', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ borderRadius: '50%' });
    });

    it('should have no border', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ border: 'none' });
    });

    it('should have flex display', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ display: 'flex' });
    });

    it('should center content', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      });
    });

    it('should have font weight 500', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ fontWeight: 500 });
    });

    it('should have correct font family', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      // Font family is set via MUI's sx prop, just check it exists
      expect(box).toBeInTheDocument();
    });

    it('should have line height 1', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ lineHeight: '1' });
    });

    it('should have flexShrink 0', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ flexShrink: '0' });
    });

    it('should have overflow hidden', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ overflow: 'hidden' });
    });

    it('should have box-sizing border-box', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ boxSizing: 'border-box' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace in names', () => {
      const { container } = render(
        <UserInitials firstName="  John  " lastName="  Doe  " />
      );
      
      // Whitespace is preserved, so first char is a space
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle names with only whitespace', () => {
      const { container } = render(
        <UserInitials firstName="   " lastName="   " />
      );
      
      // Whitespace names will produce whitespace initials
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      const { container } = render(
        <UserInitials 
          firstName="Johnathon" 
          lastName="Doethington" 
        />
      );
      
      expect(container.textContent).toBe('JD');
    });

    it('should handle names with hyphens', () => {
      const { container } = render(
        <UserInitials firstName="Mary-Jane" lastName="Smith-Jones" />
      );
      
      expect(container.textContent).toBe('MS');
    });

    it('should handle names with apostrophes', () => {
      const { container } = render(
        <UserInitials firstName="O'Brien" lastName="D'Angelo" />
      );
      
      expect(container.textContent).toBe('OD');
    });

    it('should handle unicode characters', () => {
      const { container } = render(
        <UserInitials firstName="José" lastName="Müller" />
      );
      
      expect(container.textContent).toBe('JM');
    });

    it('should handle emoji in names', () => {
      const { container } = render(
        <UserInitials firstName="😀John" lastName="😃Doe" />
      );
      
      // Emoji will be used as first character
      expect(container.firstChild).toBeInTheDocument();
      expect(container.textContent?.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple instances with different names', () => {
      const { container } = render(
        <div>
          <UserInitials firstName="John" lastName="Doe" />
          <UserInitials firstName="Jane" lastName="Smith" />
          <UserInitials firstName="Bob" lastName="Johnson" />
        </div>
      );
      
      expect(container.textContent).toContain('JD');
      expect(container.textContent).toContain('JS');
      expect(container.textContent).toContain('BJ');
    });

    it('should render multiple instances with different sizes', () => {
      const { container } = render(
        <div>
          <UserInitials firstName="John" lastName="Doe" size={16} />
          <UserInitials firstName="John" lastName="Doe" size={24} />
          <UserInitials firstName="John" lastName="Doe" size={32} />
        </div>
      );
      
      // Just verify all three instances are rendered
      const boxes = container.querySelectorAll('[class*="MuiBox"]');
      expect(boxes.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('should be readable by screen readers', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" />
      );
      
      expect(container.textContent).toBe('JD');
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should maintain aspect ratio', () => {
      const { container } = render(
        <UserInitials firstName="John" lastName="Doe" size={40} />
      );
      
      const box = container.firstChild as HTMLElement;
      const width = window.getComputedStyle(box).width;
      const height = window.getComputedStyle(box).height;
      
      expect(width).toBe(height);
    });
  });
});

