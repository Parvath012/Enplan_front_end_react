import {
  COMMON_CONTAINER_STYLES,
  FLEX_COLUMN_LAYOUT,
  FLEX_AUTO_ITEM,
  FLEX_FIXED_ITEM
} from '../../src/constants/layoutStyles';

describe('layoutStyles', () => {
  describe('COMMON_CONTAINER_STYLES', () => {
    it('should export container styles', () => {
      expect(COMMON_CONTAINER_STYLES).toBeDefined();
      expect(COMMON_CONTAINER_STYLES.container).toBeDefined();
      expect(COMMON_CONTAINER_STYLES.contentBox).toBeDefined();
      expect(COMMON_CONTAINER_STYLES.gridContainer).toBeDefined();
      expect(COMMON_CONTAINER_STYLES.gridWrapper).toBeDefined();
    });

    it('should have correct container styles', () => {
      const container = COMMON_CONTAINER_STYLES.container;
      expect(container.display).toBe('flex');
      expect(container.flexDirection).toBe('column');
      expect(container.height).toBe('100%');
      expect(container.width).toBe('100%');
      expect(container.position).toBe('relative');
      expect(container.overflow).toBe('hidden');
    });

    it('should have correct contentBox styles', () => {
      const contentBox = COMMON_CONTAINER_STYLES.contentBox;
      expect(contentBox.display).toBe('flex');
      expect(contentBox.flexDirection).toBe('column');
      expect(contentBox.flex).toBe(1);
      expect(contentBox.width).toBe('100%');
      expect(contentBox.position).toBe('relative');
      expect(contentBox.overflow).toBe('hidden');
    });

    it('should have correct gridContainer styles', () => {
      const gridContainer = COMMON_CONTAINER_STYLES.gridContainer;
      expect(gridContainer.width).toBe('100%');
      expect(gridContainer.flex).toBe(1);
      expect(gridContainer.overflow).toBe('hidden');
    });

    it('should have correct gridWrapper styles', () => {
      const gridWrapper = COMMON_CONTAINER_STYLES.gridWrapper;
      expect(gridWrapper.height).toBe('100%');
      expect(gridWrapper.width).toBe('100%');
      expect(gridWrapper.boxSizing).toBe('border-box');
      expect(gridWrapper.overflow).toBe('hidden');
      expect(gridWrapper.overflowX).toBe('hidden');
    });
  });

  describe('FLEX_COLUMN_LAYOUT', () => {
    it('should export flex column layout', () => {
      expect(FLEX_COLUMN_LAYOUT).toBeDefined();
      expect(FLEX_COLUMN_LAYOUT.display).toBe('flex');
      expect(FLEX_COLUMN_LAYOUT.flexDirection).toBe('column');
      expect(FLEX_COLUMN_LAYOUT.height).toBe('100%');
      expect(FLEX_COLUMN_LAYOUT.width).toBe('100%');
      expect(FLEX_COLUMN_LAYOUT.overflow).toBe('hidden');
    });
  });

  describe('FLEX_AUTO_ITEM', () => {
    it('should export flex auto item styles', () => {
      expect(FLEX_AUTO_ITEM).toBeDefined();
      expect(FLEX_AUTO_ITEM.flex).toBe('1 1 auto');
      expect(FLEX_AUTO_ITEM.overflow).toBe('hidden');
      expect(FLEX_AUTO_ITEM.minHeight).toBe(0);
      expect(FLEX_AUTO_ITEM.height).toBe('100%');
    });
  });

  describe('FLEX_FIXED_ITEM', () => {
    it('should export flex fixed item styles', () => {
      expect(FLEX_FIXED_ITEM).toBeDefined();
      expect(FLEX_FIXED_ITEM.flex).toBe('0 0 auto');
    });
  });

  describe('Style Consistency', () => {
    it('should have consistent overflow settings', () => {
      expect(COMMON_CONTAINER_STYLES.container.overflow).toBe('hidden');
      expect(COMMON_CONTAINER_STYLES.contentBox.overflow).toBe('hidden');
      expect(COMMON_CONTAINER_STYLES.gridContainer.overflow).toBe('hidden');
      expect(COMMON_CONTAINER_STYLES.gridWrapper.overflow).toBe('hidden');
      expect(FLEX_COLUMN_LAYOUT.overflow).toBe('hidden');
      expect(FLEX_AUTO_ITEM.overflow).toBe('hidden');
    });

    it('should have consistent width settings', () => {
      expect(COMMON_CONTAINER_STYLES.container.width).toBe('100%');
      expect(COMMON_CONTAINER_STYLES.contentBox.width).toBe('100%');
      expect(COMMON_CONTAINER_STYLES.gridContainer.width).toBe('100%');
      expect(COMMON_CONTAINER_STYLES.gridWrapper.width).toBe('100%');
      expect(FLEX_COLUMN_LAYOUT.width).toBe('100%');
    });

    it('should have consistent height settings where applicable', () => {
      expect(COMMON_CONTAINER_STYLES.container.height).toBe('100%');
      expect(COMMON_CONTAINER_STYLES.gridWrapper.height).toBe('100%');
      expect(FLEX_COLUMN_LAYOUT.height).toBe('100%');
      expect(FLEX_AUTO_ITEM.height).toBe('100%');
    });
  });
});
