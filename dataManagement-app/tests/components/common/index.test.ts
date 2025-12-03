/**
 * Test file for index.ts
 * 
 * This file tests the exports from the common components index file.
 * Since it's just export statements, we verify that the exports are accessible.
 */

import { ReusablePanel } from '../../../src/components/common';
import type { ReusablePanelProps } from '../../../src/components/common';

describe('common/index.ts', () => {
  describe('Exports', () => {
    it('should export ReusablePanel component', () => {
      expect(ReusablePanel).toBeDefined();
      expect(typeof ReusablePanel).toBe('function');
    });

    it('should export ReusablePanelProps type', () => {
      // TypeScript types are compile-time only, so we can't test them at runtime
      // But we can verify the type is accessible by using it
      const mockProps: ReusablePanelProps = {
        isOpen: true,
        onClose: jest.fn(),
        title: 'Test',
        children: null
      };
      
      expect(mockProps.isOpen).toBe(true);
      expect(mockProps.title).toBe('Test');
    });

    it('should allow importing ReusablePanelProps with all optional props', () => {
      // Test that all optional props are accessible
      const propsWithAllOptions: ReusablePanelProps = {
        isOpen: true,
        onClose: jest.fn(),
        title: 'Test',
        children: null,
        width: '480px',
        customClassName: 'test-class',
        backgroundColor: '#ffffff'
      };
      
      expect(propsWithAllOptions.width).toBe('480px');
      expect(propsWithAllOptions.customClassName).toBe('test-class');
      expect(propsWithAllOptions.backgroundColor).toBe('#ffffff');
    });
  });
});

