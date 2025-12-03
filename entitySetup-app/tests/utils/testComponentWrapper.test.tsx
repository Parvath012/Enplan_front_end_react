import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestSuspense, createTestLazyComponent, testDynamicImport } from '../../src/utils/testComponentWrapper';

describe('testComponentWrapper', () => {
  describe('TestSuspense', () => {
    it('should render children directly without Suspense', () => {
      render(
        <TestSuspense fallback={<div>Loading...</div>}>
          <div data-testid="test-content">Test Content</div>
        </TestSuspense>
      );
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render children when no fallback provided', () => {
      render(
        <TestSuspense>
          <div data-testid="test-content">Test Content</div>
        </TestSuspense>
      );
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <TestSuspense>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </TestSuspense>
      );
      
      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  describe('createTestLazyComponent', () => {
    it('should create a component with correct testid', () => {
      const TestComponent = createTestLazyComponent('MyComponent');
      
      render(<TestComponent />);
      
      expect(screen.getByTestId('test-mycomponent')).toBeInTheDocument();
      expect(screen.getByText('Test MyComponent')).toBeInTheDocument();
    });

    it('should handle component name with special characters', () => {
      const TestComponent = createTestLazyComponent('My-Component_123');
      
      render(<TestComponent />);
      
      expect(screen.getByTestId('test-my-component_123')).toBeInTheDocument();
    });

    it('should forward props correctly', () => {
      const TestComponent = createTestLazyComponent('TestComponent');
      
      render(<TestComponent className="test-class" data-custom="test-value" />);
      
      const element = screen.getByTestId('test-testcomponent');
      expect(element).toHaveClass('test-class');
      expect(element).toHaveAttribute('data-custom', 'test-value');
    });

    it('should forward ref correctly', () => {
      const TestComponent = createTestLazyComponent('TestComponent');
      const ref = React.createRef<HTMLDivElement>();
      
      render(<TestComponent ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveAttribute('data-testid', 'test-testcomponent');
    });
  });

  describe('testDynamicImport', () => {
    it('should return a promise that resolves to a component', async () => {
      const result = await testDynamicImport('path/to/MyComponent');
      
      expect(result).toHaveProperty('default');
      expect(typeof result.default).toBe('object');
    });

    it('should extract component name from module path', async () => {
      const result = await testDynamicImport('components/MyComponent');
      
      const TestComponent = result.default;
      render(<TestComponent />);
      
      expect(screen.getByTestId('test-mycomponent')).toBeInTheDocument();
    });

    it('should handle empty module name', async () => {
      const result = await testDynamicImport('');
      
      const TestComponent = result.default;
      render(<TestComponent />);
      
      expect(screen.getByTestId('test-')).toBeInTheDocument();
    });

    it('should handle module name with no path separators', async () => {
      const result = await testDynamicImport('MyComponent');
      
      const TestComponent = result.default;
      render(<TestComponent />);
      
      expect(screen.getByTestId('test-mycomponent')).toBeInTheDocument();
    });

    it('should handle complex module paths', async () => {
      const result = await testDynamicImport('src/components/forms/MyFormComponent');
      
      const TestComponent = result.default;
      render(<TestComponent />);
      
      expect(screen.getByTestId('test-myformcomponent')).toBeInTheDocument();
    });
  });
});
