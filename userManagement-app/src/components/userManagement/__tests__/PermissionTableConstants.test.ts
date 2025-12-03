import { 
  COMMON_STYLES, 
  getBaseCellStyles, 
  getBaseTextStyles, 
  getBaseSpanStyles,
  getFlexContainerStyles,
  getCommonPaddingStyles,
  getCellContentStyles,
  getButtonStyles,
  getDividerStyles
} from '../PermissionTableConstants';

describe('PermissionTableConstants', () => {
  describe('COMMON_STYLES', () => {
    it('should have all required common style properties', () => {
      expect(COMMON_STYLES.fontFamily).toBe("'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif");
      expect(COMMON_STYLES.textColor).toBe('#5F6368');
      expect(COMMON_STYLES.fontWeight).toBe(500);
      expect(COMMON_STYLES.fontSize).toBe('12px');
      expect(COMMON_STYLES.textAlign).toBe('left');
      expect(COMMON_STYLES.borderWidth).toBe('1px');
      expect(COMMON_STYLES.borderStyle).toBe('solid');
      expect(COMMON_STYLES.borderColor).toBe('rgba(242, 242, 240, 1)');
      expect(COMMON_STYLES.borderRadius).toBe('0px');
      expect(COMMON_STYLES.boxShadow).toBe('none');
      expect(COMMON_STYLES.backgroundColor).toBe('rgba(255, 255, 255, 1)');
      expect(COMMON_STYLES.activeBackgroundColor).toBe('rgba(242, 242, 240, 1)');
      expect(COMMON_STYLES.cellHeight).toBe('40px');
      expect(COMMON_STYLES.position).toBe('absolute');
      expect(COMMON_STYLES.left).toBe('0px');
      expect(COMMON_STYLES.top).toBe('0px');
      expect(COMMON_STYLES.boxSizing).toBe('border-box');
    });

    it('should have consistent border properties', () => {
      expect(COMMON_STYLES.borderLeft).toBe('0px');
      expect(COMMON_STYLES.borderTop).toBe('0px');
      expect(COMMON_STYLES.borderRight).toBe('0px');
    });

    it('should have consistent border radius properties', () => {
      expect(COMMON_STYLES.borderTopLeftRadius).toBe('0px');
      expect(COMMON_STYLES.borderTopRightRadius).toBe('0px');
      expect(COMMON_STYLES.borderBottomRightRadius).toBe('0px');
      expect(COMMON_STYLES.borderBottomLeftRadius).toBe('0px');
    });
  });

  describe('getBaseCellStyles', () => {
    it('should return base cell styles with custom width and default background', () => {
      const result = getBaseCellStyles('300px');
      
      expect(result.width).toBe('300px');
      expect(result.backgroundColor).toBe(COMMON_STYLES.backgroundColor);
      expect(result.height).toBe(COMMON_STYLES.cellHeight);
      expect(result.fontFamily).toBe(COMMON_STYLES.fontFamily);
      expect(result.color).toBe(COMMON_STYLES.textColor);
    });

    it('should return base cell styles with custom width and background', () => {
      const customBg = 'rgba(200, 200, 200, 1)';
      const result = getBaseCellStyles('400px', customBg);
      
      expect(result.width).toBe('400px');
      expect(result.backgroundColor).toBe(customBg);
      expect(result.height).toBe(COMMON_STYLES.cellHeight);
    });

    it('should include all common style properties', () => {
      const result = getBaseCellStyles('100px');
      
      // Check that all common properties are included
      expect(result.position).toBe(COMMON_STYLES.position);
      expect(result.left).toBe(COMMON_STYLES.left);
      expect(result.top).toBe(COMMON_STYLES.top);
      expect(result.boxSizing).toBe(COMMON_STYLES.boxSizing);
      expect(result.borderWidth).toBe(COMMON_STYLES.borderWidth);
      expect(result.borderStyle).toBe(COMMON_STYLES.borderStyle);
      expect(result.borderColor).toBe(COMMON_STYLES.borderColor);
      expect(result.borderRadius).toBe(COMMON_STYLES.borderRadius);
      expect(result.boxShadow).toBe(COMMON_STYLES.boxShadow);
    });
  });

  describe('getBaseTextStyles', () => {
    it('should return base text styles', () => {
      const result = getBaseTextStyles();
      
      expect(result.fontFamily).toBe(COMMON_STYLES.fontFamily);
      expect(result.fontWeight).toBe(COMMON_STYLES.fontWeight);
      expect(result.fontSize).toBe(COMMON_STYLES.fontSize);
      expect(result.color).toBe(COMMON_STYLES.textColor);
      expect(result.textAlign).toBe(COMMON_STYLES.textAlign);
    });

    it('should not include cell-specific properties', () => {
      const result = getBaseTextStyles();
      
      expect(result.width).toBeUndefined();
      expect(result.height).toBeUndefined();
      expect(result.backgroundColor).toBeUndefined();
      expect(result.position).toBeUndefined();
    });
  });

  describe('getBaseSpanStyles', () => {
    it('should return base span styles with additional properties', () => {
      const result = getBaseSpanStyles();
      
      expect(result.fontFamily).toBe(COMMON_STYLES.fontFamily);
      expect(result.fontWeight).toBe(COMMON_STYLES.fontWeight);
      expect(result.fontSize).toBe(COMMON_STYLES.fontSize);
      expect(result.color).toBe(COMMON_STYLES.textColor);
      expect(result.textAlign).toBe(COMMON_STYLES.textAlign);
      expect(result.display).toBe('inline');
      expect(result.lineHeight).toBe('1.4');
    });

    it('should extend getBaseTextStyles with additional properties', () => {
      const textStyles = getBaseTextStyles();
      const spanStyles = getBaseSpanStyles();
      
      // Should include all text styles
      expect(spanStyles.fontFamily).toBe(textStyles.fontFamily);
      expect(spanStyles.fontWeight).toBe(textStyles.fontWeight);
      expect(spanStyles.fontSize).toBe(textStyles.fontSize);
      expect(spanStyles.color).toBe(textStyles.color);
      expect(spanStyles.textAlign).toBe(textStyles.textAlign);
      
      // Should have additional span-specific properties
      expect(spanStyles.display).toBe('inline');
      expect(spanStyles.lineHeight).toBe('1.4');
    });
  });

  describe('getFlexContainerStyles', () => {
    it('should return default flex container styles', () => {
      const result = getFlexContainerStyles();
      
      expect(result.display).toBe('flex');
      expect(result.flexDirection).toBe('row');
      expect(result.gap).toBe('4px');
      expect(result.alignItems).toBe('center');
    });

    it('should return custom flex container styles', () => {
      const result = getFlexContainerStyles('column', '8px');
      
      expect(result.display).toBe('flex');
      expect(result.flexDirection).toBe('column');
      expect(result.gap).toBe('8px');
      expect(result.alignItems).toBe('center');
    });
  });

  describe('getCommonPaddingStyles', () => {
    it('should return common padding styles', () => {
      const result = getCommonPaddingStyles();
      
      expect(result.paddingLeft).toBe('12px');
      expect(result.paddingRight).toBe('12px');
    });
  });

  describe('getCellContentStyles', () => {
    it('should return cell content styles', () => {
      const result = getCellContentStyles();
      
      expect(result.display).toBe('flex');
      expect(result.alignItems).toBe('center');
      expect(result.paddingLeft).toBe('12px');
      expect(result.paddingRight).toBe('12px');
      expect(result.height).toBe('100%');
    });
  });

  describe('getButtonStyles', () => {
    it('should return default button styles', () => {
      const result = getButtonStyles();
      
      expect(result.width).toBe('28px');
      expect(result.height).toBe('28px');
    });

    it('should return custom button styles', () => {
      const result = getButtonStyles('32px');
      
      expect(result.width).toBe('32px');
      expect(result.height).toBe('32px');
    });
  });

  describe('getDividerStyles', () => {
    it('should return divider styles', () => {
      const result = getDividerStyles();
      
      expect(result.width).toBe('1px');
      expect(result.height).toBe('19px');
      expect(result.backgroundColor).toBe('#e0e0e0');
      expect(result.margin).toBe('0 4px');
    });
  });
});
