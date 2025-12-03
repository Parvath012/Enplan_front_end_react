import { TOOLTIP_CONFIG, LAYOUT_CONTAINER_STYLES, FOOTER_CONTAINER_STYLES } from '../../src/constants/tooltipStyles';

describe('tooltipStyles constants', () => {
  describe('TOOLTIP_CONFIG', () => {
    it('should have correct arrow property', () => {
      expect(TOOLTIP_CONFIG.arrow).toBe(false);
    });

    it('should have correct delay properties', () => {
      expect(TOOLTIP_CONFIG.enterDelay).toBe(500);
      expect(TOOLTIP_CONFIG.leaveDelay).toBe(0);
    });

    it('should have slotProps with tooltip styles', () => {
      expect(TOOLTIP_CONFIG.slotProps).toHaveProperty('tooltip');
      expect(TOOLTIP_CONFIG.slotProps.tooltip).toHaveProperty('sx');
      
      const tooltipSx = TOOLTIP_CONFIG.slotProps.tooltip.sx;
      expect(tooltipSx).toHaveProperty('backgroundColor', 'white');
      expect(tooltipSx).toHaveProperty('color', '#333');
      expect(tooltipSx).toHaveProperty('fontSize', '12px');
      expect(tooltipSx).toHaveProperty('fontFamily', 'Roboto, Arial, sans-serif');
      expect(tooltipSx).toHaveProperty('padding', '6px 10px');
      expect(tooltipSx).toHaveProperty('borderRadius', '4px');
      expect(tooltipSx).toHaveProperty('border', '1px solid #000');
      expect(tooltipSx).toHaveProperty('boxShadow', '0 2px 5px rgba(0, 0, 0, 0.1)');
      expect(tooltipSx).toHaveProperty('fontWeight', 500);
    });

    it('should have popper configuration with modifiers', () => {
      expect(TOOLTIP_CONFIG.slotProps).toHaveProperty('popper');
      expect(TOOLTIP_CONFIG.slotProps.popper).toHaveProperty('modifiers');
      
      const modifiers = TOOLTIP_CONFIG.slotProps.popper.modifiers;
      expect(Array.isArray(modifiers)).toBe(true);
      expect(modifiers.length).toBe(1);
      
      const offsetModifier = modifiers[0];
      expect(offsetModifier.name).toBe('offset');
      expect(offsetModifier.options).toEqual({ offset: [0, 8] });
    });

    it('should be reusable across components', () => {
      // Test that the config can be spread and used multiple times
      const config1 = { ...TOOLTIP_CONFIG };
      const config2 = { ...TOOLTIP_CONFIG };
      
      expect(config1.arrow).toBe(false);
      expect(config2.arrow).toBe(false);
      expect(config1).toEqual(config2);
    });
  });

  describe('LAYOUT_CONTAINER_STYLES', () => {
    it('should have flex display', () => {
      expect(LAYOUT_CONTAINER_STYLES.display).toBe('flex');
    });

    it('should have column flex direction', () => {
      expect(LAYOUT_CONTAINER_STYLES.flexDirection).toBe('column');
    });

    it('should have 100% width', () => {
      expect(LAYOUT_CONTAINER_STYLES.width).toBe('100%');
    });

    it('should have hidden overflow', () => {
      expect(LAYOUT_CONTAINER_STYLES.overflow).toBe('hidden');
    });

    it('should contain all required properties', () => {
      const keys = Object.keys(LAYOUT_CONTAINER_STYLES);
      expect(keys).toContain('display');
      expect(keys).toContain('flexDirection');
      expect(keys).toContain('width');
      expect(keys).toContain('overflow');
      expect(keys.length).toBe(4);
    });
  });

  describe('FOOTER_CONTAINER_STYLES', () => {
    it('should have flex property', () => {
      expect(FOOTER_CONTAINER_STYLES.flex).toBe('0 0 auto');
    });

    it('should contain only flex property', () => {
      const keys = Object.keys(FOOTER_CONTAINER_STYLES);
      expect(keys).toEqual(['flex']);
      expect(keys.length).toBe(1);
    });
  });

  describe('Integration', () => {
    it('should be importable together', () => {
      expect(TOOLTIP_CONFIG).toBeDefined();
      expect(LAYOUT_CONTAINER_STYLES).toBeDefined();
      expect(FOOTER_CONTAINER_STYLES).toBeDefined();
    });

    it('should maintain type consistency', () => {
      expect(typeof TOOLTIP_CONFIG).toBe('object');
      expect(typeof LAYOUT_CONTAINER_STYLES).toBe('object');
      expect(typeof FOOTER_CONTAINER_STYLES).toBe('object');
    });
  });
});

