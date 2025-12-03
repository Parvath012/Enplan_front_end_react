import {
  DRAWER_STYLES,
  HEADER_STYLES,
  ADMIN_HEADER_STYLES,
  MAIN_CONTENT_STYLES
} from '../../src/constants/structureStyles';

describe('structureStyles', () => {
  describe('DRAWER_STYLES', () => {
    it('should export DRAWER_STYLES with correct structure', () => {
      expect(DRAWER_STYLES).toBeDefined();
      expect(typeof DRAWER_STYLES).toBe('object');
      expect('& .MuiDrawer-paper' in DRAWER_STYLES).toBe(true);
      expect('zIndex' in DRAWER_STYLES).toBe(true);
    });

    it('should have correct drawer paper styles', () => {
      const drawerPaper = DRAWER_STYLES['& .MuiDrawer-paper'];
      expect(drawerPaper).toBeDefined();
      expect(drawerPaper.width).toBe('100%');
      expect(drawerPaper.maxWidth).toBe('1400px');
      expect(drawerPaper.height).toBe('100%');
      expect(drawerPaper.maxHeight).toBe('100%');
      expect(drawerPaper.borderTopLeftRadius).toBe(8);
      expect(drawerPaper.borderTopRightRadius).toBe(8);
      expect(drawerPaper.paddingTop).toBe('40px');
      expect(drawerPaper.paddingLeft).toBe('50px');
      expect(drawerPaper.boxShadow).toBe('0 -2px 10px rgba(0,0,0,0.08)');
      expect(drawerPaper.bgcolor).toBe('#fff');
      expect(drawerPaper.display).toBe('flex');
      expect(drawerPaper.flexDirection).toBe('column');
      expect(drawerPaper.position).toBe('relative');
      expect(drawerPaper.overflow).toBe('hidden');
      expect(drawerPaper.margin).toBe('0 auto');
    });

    it('should have correct zIndex', () => {
      expect(DRAWER_STYLES.zIndex).toBe(900);
    });
  });

  describe('HEADER_STYLES', () => {
    it('should export HEADER_STYLES with correct structure', () => {
      expect(HEADER_STYLES).toBeDefined();
      expect(typeof HEADER_STYLES).toBe('object');
    });

    it('should have correct header styles', () => {
      expect(HEADER_STYLES.position).toBe('sticky');
      expect(HEADER_STYLES.top).toBe(0);
      expect(HEADER_STYLES.zIndex).toBe(1000);
      expect(HEADER_STYLES.backgroundColor).toBe('#fff');
      expect(HEADER_STYLES.boxShadow).toBe('0 1px 2px rgba(0,0,0,0.05)');
      expect(HEADER_STYLES.width).toBe('100%');
      expect(HEADER_STYLES.height).toBe('40px');
      expect(HEADER_STYLES.minHeight).toBe('40px');
      expect(HEADER_STYLES.flexShrink).toBe(0);
      expect(HEADER_STYLES.borderBottom).toBe('1px solid #e0e0e0');
    });
  });

  describe('ADMIN_HEADER_STYLES', () => {
    it('should export ADMIN_HEADER_STYLES with correct structure', () => {
      expect(ADMIN_HEADER_STYLES).toBeDefined();
      expect(typeof ADMIN_HEADER_STYLES).toBe('object');
    });

    it('should have correct admin header styles', () => {
      expect(ADMIN_HEADER_STYLES.position).toBe('sticky');
      expect(ADMIN_HEADER_STYLES.top).toBe(0);
      expect(ADMIN_HEADER_STYLES.zIndex).toBe(1001);
    });
  });

  describe('MAIN_CONTENT_STYLES', () => {
    it('should export MAIN_CONTENT_STYLES with correct structure', () => {
      expect(MAIN_CONTENT_STYLES).toBeDefined();
      expect(typeof MAIN_CONTENT_STYLES).toBe('object');
    });

    it('should have correct main content styles', () => {
      expect(MAIN_CONTENT_STYLES.flex).toBe(1);
      expect(MAIN_CONTENT_STYLES.position).toBe('relative');
      expect(MAIN_CONTENT_STYLES.backgroundColor).toBe('#fafafa');
      expect(MAIN_CONTENT_STYLES.overflow).toBe('hidden');
    });
  });

  describe('Style consistency', () => {
    it('should have consistent zIndex ordering', () => {
      expect(DRAWER_STYLES.zIndex).toBeLessThan(HEADER_STYLES.zIndex);
      expect(HEADER_STYLES.zIndex).toBeLessThan(ADMIN_HEADER_STYLES.zIndex);
    });

    it('should have all styles as objects', () => {
      expect(typeof DRAWER_STYLES).toBe('object');
      expect(typeof HEADER_STYLES).toBe('object');
      expect(typeof ADMIN_HEADER_STYLES).toBe('object');
      expect(typeof MAIN_CONTENT_STYLES).toBe('object');
    });
  });
});

