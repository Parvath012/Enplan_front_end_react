import React from 'react';
import { render, screen } from '@testing-library/react';
import TabPanel from '../../../src/components/userList/TabPanel';

describe('TabPanel', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          <div>Test Content</div>
        </TabPanel>
      );
      
      expect(container).toBeInTheDocument();
    });

    it('should render children when value matches index', () => {
      render(
        <TabPanel value={0} index={0}>
          <div>Visible Content</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });

    it('should not render children when value does not match index', () => {
      render(
        <TabPanel value={1} index={0}>
          <div>Hidden Content</div>
        </TabPanel>
      );
      
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });

    it('should render with correct role attribute', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          <div>Content</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toBeInTheDocument();
    });

    it('should have correct id attribute', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          <div>Content</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveAttribute('id', 'user-tabpanel-0');
    });

    it('should have correct aria-labelledby attribute', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          <div>Content</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'user-tab-0');
    });
  });

  describe('Visibility Control', () => {
    it('should show content when value equals index (0)', () => {
      render(
        <TabPanel value={0} index={0}>
          <div>Tab 0 Content</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Tab 0 Content')).toBeVisible();
    });

    it('should hide content when value does not equal index', () => {
      const { container } = render(
        <TabPanel value={1} index={0}>
          <div>Tab 0 Content</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveAttribute('hidden');
    });

    it('should show content for tab index 1', () => {
      render(
        <TabPanel value={1} index={1}>
          <div>Tab 1 Content</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Tab 1 Content')).toBeVisible();
    });

    it('should show content for tab index 2', () => {
      render(
        <TabPanel value={2} index={2}>
          <div>Tab 2 Content</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Tab 2 Content')).toBeVisible();
    });

    it('should hide content when switching tabs', () => {
      const { rerender } = render(
        <TabPanel value={0} index={0}>
          <div>Tab 0 Content</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Tab 0 Content')).toBeVisible();
      
      rerender(
        <TabPanel value={1} index={0}>
          <div>Tab 0 Content</div>
        </TabPanel>
      );
      
      expect(screen.queryByText('Tab 0 Content')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Tab Panels', () => {
    it('should render multiple tab panels with only one visible', () => {
      render(
        <>
          <TabPanel value={0} index={0}>
            <div>Tab 0</div>
          </TabPanel>
          <TabPanel value={0} index={1}>
            <div>Tab 1</div>
          </TabPanel>
          <TabPanel value={0} index={2}>
            <div>Tab 2</div>
          </TabPanel>
        </>
      );
      
      expect(screen.getByText('Tab 0')).toBeInTheDocument();
      expect(screen.queryByText('Tab 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Tab 2')).not.toBeInTheDocument();
    });

    it('should show different tab when value changes', () => {
      render(
        <>
          <TabPanel value={1} index={0}>
            <div>Tab 0</div>
          </TabPanel>
          <TabPanel value={1} index={1}>
            <div>Tab 1</div>
          </TabPanel>
          <TabPanel value={1} index={2}>
            <div>Tab 2</div>
          </TabPanel>
        </>
      );
      
      expect(screen.queryByText('Tab 0')).not.toBeInTheDocument();
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.queryByText('Tab 2')).not.toBeInTheDocument();
    });
  });

  describe('Children Content', () => {
    it('should render text children', () => {
      render(
        <TabPanel value={0} index={0}>
          Simple Text Content
        </TabPanel>
      );
      
      expect(screen.getByText('Simple Text Content')).toBeInTheDocument();
    });

    it('should render JSX children', () => {
      render(
        <TabPanel value={0} index={0}>
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
          </div>
        </TabPanel>
      );
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });

    it('should render complex nested children', () => {
      render(
        <TabPanel value={0} index={0}>
          <div>
            <section>
              <article>
                <span>Nested Content</span>
              </article>
            </section>
          </div>
        </TabPanel>
      );
      
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <TabPanel value={0} index={0}>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </TabPanel>
      );
      
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should render empty children', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          {null}
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toBeInTheDocument();
    });

    it('should render undefined children', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          {undefined}
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toBeInTheDocument();
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have unique id for each tab panel', () => {
      const { container } = render(
        <>
          <TabPanel value={0} index={0}><div>Tab 0</div></TabPanel>
          <TabPanel value={0} index={1}><div>Tab 1</div></TabPanel>
          <TabPanel value={0} index={2}><div>Tab 2</div></TabPanel>
        </>
      );
      
      expect(container.querySelector('#user-tabpanel-0')).toBeInTheDocument();
      expect(container.querySelector('#user-tabpanel-1')).toBeInTheDocument();
      expect(container.querySelector('#user-tabpanel-2')).toBeInTheDocument();
    });

    it('should have unique aria-labelledby for each tab panel', () => {
      const { container } = render(
        <>
          <TabPanel value={0} index={0}><div>Tab 0</div></TabPanel>
          <TabPanel value={0} index={1}><div>Tab 1</div></TabPanel>
          <TabPanel value={0} index={2}><div>Tab 2</div></TabPanel>
        </>
      );
      
      const panels = container.querySelectorAll('[role="tabpanel"]');
      expect(panels[0]).toHaveAttribute('aria-labelledby', 'user-tab-0');
      expect(panels[1]).toHaveAttribute('aria-labelledby', 'user-tab-1');
      expect(panels[2]).toHaveAttribute('aria-labelledby', 'user-tab-2');
    });

    it('should have hidden attribute when not active', () => {
      const { container } = render(
        <TabPanel value={1} index={0}>
          <div>Hidden Tab</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveAttribute('hidden');
    });

    it('should not have hidden attribute when active', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          <div>Active Tab</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).not.toHaveAttribute('hidden');
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative index', () => {
      const { container } = render(
        <TabPanel value={-1} index={-1}>
          <div>Negative Index</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveAttribute('id', 'user-tabpanel--1');
      expect(screen.getByText('Negative Index')).toBeInTheDocument();
    });

    it('should handle large index numbers', () => {
      const { container } = render(
        <TabPanel value={999} index={999}>
          <div>Large Index</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveAttribute('id', 'user-tabpanel-999');
      expect(screen.getByText('Large Index')).toBeInTheDocument();
    });

    it('should handle value and index mismatch', () => {
      render(
        <TabPanel value={5} index={0}>
          <div>Mismatched</div>
        </TabPanel>
      );
      
      expect(screen.queryByText('Mismatched')).not.toBeInTheDocument();
    });

    it('should handle zero values', () => {
      render(
        <TabPanel value={0} index={0}>
          <div>Zero Values</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Zero Values')).toBeInTheDocument();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update visibility when value prop changes', () => {
      const { rerender } = render(
        <TabPanel value={0} index={0}>
          <div>Dynamic Content</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Dynamic Content')).toBeVisible();
      
      rerender(
        <TabPanel value={1} index={0}>
          <div>Dynamic Content</div>
        </TabPanel>
      );
      
      expect(screen.queryByText('Dynamic Content')).not.toBeInTheDocument();
      
      rerender(
        <TabPanel value={0} index={0}>
          <div>Dynamic Content</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Dynamic Content')).toBeVisible();
    });

    it('should update children content', () => {
      const { rerender } = render(
        <TabPanel value={0} index={0}>
          <div>Original Content</div>
        </TabPanel>
      );
      
      expect(screen.getByText('Original Content')).toBeInTheDocument();
      
      rerender(
        <TabPanel value={0} index={0}>
          <div>Updated Content</div>
        </TabPanel>
      );
      
      expect(screen.queryByText('Original Content')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Content')).toBeInTheDocument();
    });
  });

  describe('Box Component Wrapper', () => {
    it('should wrap children in Box component when visible', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          <div data-testid="child-content">Content</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      const box = tabpanel?.firstChild;
      
      expect(box).toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should not render Box when not visible', () => {
      const { container } = render(
        <TabPanel value={1} index={0}>
          <div data-testid="child-content">Content</div>
        </TabPanel>
      );
      
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });
  });

  describe('Additional Props', () => {
    it('should pass through additional props', () => {
      const { container } = render(
        <TabPanel value={0} index={0} data-testid="custom-tabpanel">
          <div>Content</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveAttribute('data-testid', 'custom-tabpanel');
    });

    it('should handle custom className', () => {
      const { container } = render(
        <TabPanel value={0} index={0} className="custom-class">
          <div>Content</div>
        </TabPanel>
      );
      
      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveClass('custom-class');
    });
  });
});

