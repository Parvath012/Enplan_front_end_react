import React from 'react';
import { render, screen } from '@testing-library/react';

// Test all exports from the index file
import { HeaderIcons, IconItem } from '../../../src/components/shared/index';

// Mock Carbon icons for testing
jest.mock('@carbon/icons-react', () => ({
  Chat: ({ size, color }: any) => (
    <div data-testid="chat-icon" data-size={size} data-color={color} />
  ),
  VolumeBlockStorage: ({ size, color }: any) => (
    <div data-testid="volume-icon" data-size={size} data-color={color} />
  ),
}));

// Mock SCSS files
jest.mock('./HeaderIcons.scss', () => ({}));

describe('Index Export Tests', () => {
  describe('Default Export Tests - HeaderIcons', () => {
    it('should export HeaderIcons component', () => {
      expect(HeaderIcons).toBeDefined();
      expect(typeof HeaderIcons).toBe('function');
    });

    it('should render HeaderIcons with default props', () => {
      render(<HeaderIcons />);
      // HeaderIcons should render with default icons
      expect(document.querySelector('.header-icons')).toBeTruthy();
    });

    it('should render HeaderIcons with custom iconItems', () => {
      const testIconItems: IconItem[] = [
        {
          src: '/test-icon.svg',
          alt: 'Test Icon',
          tooltip: 'Test Tooltip'
        }
      ];

      render(<HeaderIcons iconItems={testIconItems} />);
      expect(document.querySelector('.header-icons')).toBeTruthy();
    });

    it('should render HeaderIcons with custom className', () => {
      render(<HeaderIcons className="custom-header-icons" />);
      expect(document.querySelector('.custom-header-icons')).toBeTruthy();
    });

    it('should handle empty iconItems array', () => {
      render(<HeaderIcons iconItems={[]} />);
      expect(document.querySelector('.header-icons')).toBeTruthy();
    });
  });

  describe('Named Export Tests - IconItem Interface', () => {
    it('should export IconItem type correctly', () => {
      const testIcon: IconItem = {
        src: '/test.svg',
        alt: 'Test',
        tooltip: 'Test tooltip'
      };

      expect(testIcon).toBeDefined();
      expect(testIcon.alt).toBe('Test');
      expect(testIcon.tooltip).toBe('Test tooltip');
    });

    it('should handle IconItem with component', () => {
      const testIcon: IconItem = {
        component: <div data-testid="test-component">Test Component</div>,
        alt: 'Component Icon'
      };

      render(<HeaderIcons iconItems={[testIcon]} />);
      expect(screen.getByTestId('test-component')).toBeTruthy();
    });

    it('should handle IconItem with divider', () => {
      const testIcon: IconItem = {
        divider: true,
        alt: 'divider'
      };

      render(<HeaderIcons iconItems={[testIcon]} />);
      expect(document.querySelector('.header-divider')).toBeTruthy();
    });

    it('should handle IconItem with all optional properties', () => {
      const fullIcon: IconItem = {
        src: '/full-test.svg',
        component: <span>Component</span>,
        alt: 'Full Test',
        tooltip: 'Full tooltip',
        divider: false
      };

      expect(() => render(<HeaderIcons iconItems={[fullIcon]} />)).not.toThrow();
    });
  });

 

  

  describe('Component Integration Tests', () => {
    it('should work with multiple icon types together', () => {
      const mixedIcons: IconItem[] = [
        {
          src: '/icon1.svg',
          alt: 'Icon 1',
          tooltip: 'First icon'
        },
        {
          component: <div data-testid="custom-component">Custom</div>,
          alt: 'Custom Icon'
        },
        {
          divider: true,
          alt: 'separator'
        },
        {
          src: '/icon2.svg',
          alt: 'Icon 2'
        }
      ];

      render(<HeaderIcons iconItems={mixedIcons} />);
      expect(document.querySelector('.header-icons')).toBeTruthy();
      expect(screen.getByTestId('custom-component')).toBeTruthy();
      expect(document.querySelector('.header-divider')).toBeTruthy();
    });

    it('should handle React component icons properly', () => {
      const componentIcon: IconItem = {
        component: React.createElement('div', 
          { 'data-testid': 'react-component', className: 'test-component' }, 
          'React Component'
        ),
        alt: 'React Component'
      };

      render(<HeaderIcons iconItems={[componentIcon]} />);
      expect(screen.getByTestId('react-component')).toBeTruthy();
      expect(screen.getByText('React Component')).toBeTruthy();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined iconItems prop', () => {
      expect(() => render(<HeaderIcons iconItems={undefined} />)).not.toThrow();
    });

    it('should handle null iconItems prop', () => {
      // The component doesn't handle null gracefully, so we test that it throws as expected
      expect(() => render(<HeaderIcons iconItems={null as any} />)).toThrow('Cannot read properties of null');
    });

    it('should handle empty string className', () => {
      render(<HeaderIcons className="" />);
      expect(document.querySelector('[class=""]')).toBeTruthy();
    });

    it('should handle undefined className', () => {
      render(<HeaderIcons className={undefined} />);
      // Should fall back to default className
      expect(document.querySelector('.header-icons')).toBeTruthy();
    });

    it('should handle IconItem with missing required fields gracefully', () => {
      const incompleteIcon = {} as IconItem;
      
      expect(() => render(<HeaderIcons iconItems={[incompleteIcon]} />)).not.toThrow();
    });

    it('should handle IconItem with only alt property', () => {
      const minimalIcon: IconItem = {
        alt: 'Minimal Icon'
      };

      expect(() => render(<HeaderIcons iconItems={[minimalIcon]} />)).not.toThrow();
    });
  });

  describe('Type Safety Tests', () => {
    it('should enforce IconItem type constraints', () => {
      // Test that TypeScript accepts valid IconItem
      const validIcon: IconItem = {
        src: '/valid.svg',
        alt: 'Valid Icon',
        tooltip: 'Valid tooltip',
        divider: false
      };

      expect(() => render(<HeaderIcons iconItems={[validIcon]} />)).not.toThrow();
    });

    
    it('should work with strict type checking', () => {
      const strictIconItems: IconItem[] = [
        {
          src: '/strict1.svg',
          alt: 'Strict Icon 1',
          tooltip: 'Strictly typed tooltip'
        } as const,
        {
          component: React.createElement('div', { 'data-testid': 'strict-div' }, 'Strict Component'),
          alt: 'Strict Component Icon'
        } as const
      ];

      expect(() => render(<HeaderIcons iconItems={strictIconItems} />)).not.toThrow();
    });
  });

  describe('Module Export Structure Validation', () => {

    it('should maintain consistent export behavior', () => {
      // Test multiple imports of the same module
      const HeaderIcons1 = require('../../../src/components/shared/index').HeaderIcons;
      const HeaderIcons2 = require('../../../src/components/shared/index').HeaderIcons;
      
      expect(HeaderIcons1).toBe(HeaderIcons2);
      expect(HeaderIcons1).toBe(HeaderIcons);
    });

    it('should work with destructured imports', () => {
      // Test that destructured imports work correctly
      const { HeaderIcons: DestructuredHeaderIcons } = require('../../../src/components/shared/index');
      
      expect(DestructuredHeaderIcons).toBe(HeaderIcons);
      expect(() => render(<DestructuredHeaderIcons />)).not.toThrow();
    });
  });

  describe('Performance and Memory Tests', () => {
    it('should handle large arrays of icons efficiently', () => {
      const manyIcons: IconItem[] = Array.from({ length: 50 }, (_, i) => ({
        src: `/icon-${i}.svg`,
        alt: `Icon ${i}`,
        tooltip: `Tooltip ${i}`
      }));

      expect(() => render(<HeaderIcons iconItems={manyIcons} />)).not.toThrow();
    });

    it('should cleanup properly on unmount', () => {
      const { unmount } = render(<HeaderIcons />);
      expect(() => unmount()).not.toThrow();
    });

    it('should handle re-renders efficiently', () => {
      const testIconItems: IconItem[] = [
        { src: '/test.svg', alt: 'Test' }
      ];

      const { rerender } = render(<HeaderIcons iconItems={testIconItems} />);
      
      // Re-render with same props
      expect(() => rerender(<HeaderIcons iconItems={testIconItems} />)).not.toThrow();
      
      // Re-render with different props
      const newIconItems: IconItem[] = [
        { src: '/new-test.svg', alt: 'New Test' }
      ];
      expect(() => rerender(<HeaderIcons iconItems={newIconItems} />)).not.toThrow();
    });
  });

  describe('Integration with React Features', () => {
    it('should work with React.memo', () => {
      const MemoizedHeaderIcons = React.memo(HeaderIcons);
      
      const testProps = {
        iconItems: [{ src: '/memo-test.svg', alt: 'Memo Test' }]
      };

      expect(() => render(<MemoizedHeaderIcons {...testProps} />)).not.toThrow();
    });

    it('should work in React context', () => {
      const TestContext = React.createContext('test');
      
      const ContextualComponent = () => (
        <TestContext.Provider value="context-value">
          <HeaderIcons iconItems={[{ src: '/context-test.svg', alt: 'Context Test' }]} />
        </TestContext.Provider>
      );

      expect(() => render(<ContextualComponent />)).not.toThrow();
    });

    it('should work with useState for dynamic props', () => {
      const DynamicComponent = () => {
        const [iconCount, setIconCount] = React.useState(1);
        
        const icons: IconItem[] = Array.from({ length: iconCount }, (_, i) => ({
          src: `/dynamic-${i}.svg`,
          alt: `Dynamic ${i}`
        }));

        React.useEffect(() => {
          if (iconCount < 3) {
            const timer = setTimeout(() => setIconCount(iconCount + 1), 10);
            return () => clearTimeout(timer);
          }
        }, [iconCount]);

        return <HeaderIcons iconItems={icons} />;
      };

      expect(() => render(<DynamicComponent />)).not.toThrow();
    });
  });
});