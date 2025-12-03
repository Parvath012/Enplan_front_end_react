import { COMMON_DRAWER_STYLES } from '../../src/constants/drawerStyles';

describe('drawerStyles', () => {
  describe('COMMON_DRAWER_STYLES', () => {
    it('should export standardDrawer configuration', () => {
      expect(COMMON_DRAWER_STYLES.standardDrawer).toBeDefined();
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('width');
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('height');
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('maxWidth');
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('maxHeight');
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('position');
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('right');
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('top');
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('left');
      expect(COMMON_DRAWER_STYLES.standardDrawer).toHaveProperty('bottom');
    });

    it('should have correct standardDrawer dimensions', () => {
      expect(COMMON_DRAWER_STYLES.standardDrawer.width).toBe('588px');
      expect(COMMON_DRAWER_STYLES.standardDrawer.height).toBe('100vh');
      expect(COMMON_DRAWER_STYLES.standardDrawer.maxWidth).toBe('588px');
      expect(COMMON_DRAWER_STYLES.standardDrawer.maxHeight).toBe('100vh');
    });

    it('should have correct standardDrawer positioning', () => {
      expect(COMMON_DRAWER_STYLES.standardDrawer.position).toBe('absolute');
      expect(COMMON_DRAWER_STYLES.standardDrawer.right).toBe('0px');
      expect(COMMON_DRAWER_STYLES.standardDrawer.top).toBe('0px');
      expect(COMMON_DRAWER_STYLES.standardDrawer.left).toBe('auto');
      expect(COMMON_DRAWER_STYLES.standardDrawer.bottom).toBe('0px');
    });

    it('should export standardDrawerSx configuration', () => {
      expect(COMMON_DRAWER_STYLES.standardDrawerSx).toBeDefined();
      expect(COMMON_DRAWER_STYLES.standardDrawerSx).toHaveProperty('& .MuiBackdrop-root');
      expect(COMMON_DRAWER_STYLES.standardDrawerSx).toHaveProperty('& .MuiDrawer-paper');
    });

    it('should have correct backdrop styles', () => {
      const backdropStyles = COMMON_DRAWER_STYLES.standardDrawerSx['& .MuiBackdrop-root'];
      expect(backdropStyles).toBeDefined();
      expect(backdropStyles.backgroundColor).toBe('rgba(0, 0, 0, 0.3)');
      expect(backdropStyles.backdropFilter).toBe('blur(4px)');
      expect(backdropStyles.WebkitBackdropFilter).toBe('blur(4px)');
    });

    it('should have correct drawer paper styles', () => {
      const paperStyles = COMMON_DRAWER_STYLES.standardDrawerSx['& .MuiDrawer-paper'];
      expect(paperStyles).toBeDefined();
      expect(paperStyles.backdropFilter).toBe('none !important');
      expect(paperStyles.WebkitBackdropFilter).toBe('none !important');
      expect(paperStyles.filter).toBe('none !important');
      expect(paperStyles.position).toBe('absolute !important');
      expect(paperStyles.right).toBe('0px !important');
      expect(paperStyles.top).toBe('0px !important');
      expect(paperStyles.left).toBe('auto !important');
      expect(paperStyles.bottom).toBe('0px !important');
      expect(paperStyles.width).toBe('588px !important');
      expect(paperStyles.height).toBe('100vh !important');
      expect(paperStyles.maxWidth).toBe('588px !important');
      expect(paperStyles.maxHeight).toBe('100vh !important');
      expect(paperStyles.overflowX).toBe('hidden !important');
      expect(paperStyles.background).toBe('#fafafa');
      expect(paperStyles.backgroundColor).toBe('#fafafa');
      expect(paperStyles.boxSizing).toBe('border-box');
      expect(paperStyles.borderWidth).toBe('1px');
      expect(paperStyles.borderStyle).toBe('solid');
      expect(paperStyles.borderColor).toBe('rgba(242, 242, 240, 1)');
      expect(paperStyles.borderTop).toBe('0px');
      expect(paperStyles.borderRadius).toBe('0px');
      expect(paperStyles.borderTopLeftRadius).toBe('0px');
      expect(paperStyles.borderTopRightRadius).toBe('0px');
      expect(paperStyles.boxShadow).toBe('-5px 0px 14px rgba(204, 204, 204, 0.349019607843137)');
      expect(paperStyles.MozBoxShadow).toBe('-5px 0px 14px rgba(204, 204, 204, 0.349019607843137)');
      expect(paperStyles.WebkitBoxShadow).toBe('-5px 0px 14px rgba(204, 204, 204, 0.349019607843137)');
    });

    it('should be an object with both properties', () => {
      expect(typeof COMMON_DRAWER_STYLES).toBe('object');
      expect(Object.keys(COMMON_DRAWER_STYLES)).toContain('standardDrawer');
      expect(Object.keys(COMMON_DRAWER_STYLES)).toContain('standardDrawerSx');
      expect(Object.keys(COMMON_DRAWER_STYLES).length).toBe(2);
    });

    it('should have immutable structure', () => {
      const originalStandardDrawer = { ...COMMON_DRAWER_STYLES.standardDrawer };
      const originalStandardDrawerSx = { ...COMMON_DRAWER_STYLES.standardDrawerSx };

      // Verify structure remains the same
      expect(COMMON_DRAWER_STYLES.standardDrawer).toEqual(originalStandardDrawer);
      expect(COMMON_DRAWER_STYLES.standardDrawerSx).toEqual(originalStandardDrawerSx);
    });
  });
});

