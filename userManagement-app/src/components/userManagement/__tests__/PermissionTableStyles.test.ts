import { permissionTableStyles } from '../PermissionTableStyles';

describe('PermissionTableStyles', () => {
  describe('permissionTableStyles', () => {
    it('should export all required style objects', () => {
      expect(permissionTableStyles).toBeDefined();
      expect(permissionTableStyles.rowText).toBeDefined();
      expect(permissionTableStyles.cell).toBeDefined();
      expect(permissionTableStyles.highlightedCell).toBeDefined();
      expect(permissionTableStyles.moduleIcon).toBeDefined();
      expect(permissionTableStyles.subModuleCell).toBeDefined();
    });

    it('should have consistent base styles across all cell types', () => {
      const { cell, highlightedCell, subModuleCell } = permissionTableStyles;
      
      // Check that all cells have the same base properties
      expect(cell.position).toBe('absolute');
      expect(highlightedCell.position).toBe('absolute');
      expect(subModuleCell.position).toBe('absolute');
      
      expect(cell.height).toBe('40px');
      expect(highlightedCell.height).toBe('40px');
      expect(subModuleCell.height).toBe('40px');
      
      expect(cell.fontFamily).toBe("'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif");
      expect(highlightedCell.fontFamily).toBe("'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif");
      expect(subModuleCell.fontFamily).toBe("'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif");
    });

    it('should have different widths for different cell types', () => {
      expect(permissionTableStyles.cell.width).toBe('354px');
      expect(permissionTableStyles.highlightedCell.width).toBe('288px');
      expect(permissionTableStyles.subModuleCell.width).toBe('300px');
    });

    it('should have different background colors for different cell types', () => {
      expect(permissionTableStyles.cell.backgroundColor).toBe('rgba(255, 255, 255, 1)');
      expect(permissionTableStyles.highlightedCell.backgroundColor).toBe('rgba(242, 242, 240, 1)');
      expect(permissionTableStyles.subModuleCell.backgroundColor).toBe('rgba(255, 255, 255, 1)');
    });

    it('should have consistent text styles', () => {
      const { rowText } = permissionTableStyles;
      
      expect(rowText.fontFamily).toBe("'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif");
      expect(rowText.fontWeight).toBe(500);
      expect(rowText.fontSize).toBe('12px');
      expect(rowText.color).toBe('#5F6368');
      expect(rowText.textAlign).toBe('left');
    });

    it('should have proper icon styling', () => {
      const { moduleIcon } = permissionTableStyles;
      
      expect(moduleIcon.width).toBe('14px');
      expect(moduleIcon.height).toBe('13px');
      expect(moduleIcon.marginRight).toBe('8px');
    });

    it('should have consistent border styles', () => {
      const { cell, highlightedCell, subModuleCell } = permissionTableStyles;
      
      expect(cell.borderWidth).toBe('1px');
      expect(highlightedCell.borderWidth).toBe('1px');
      expect(subModuleCell.borderWidth).toBe('1px');
      
      expect(cell.borderStyle).toBe('solid');
      expect(highlightedCell.borderStyle).toBe('solid');
      expect(subModuleCell.borderStyle).toBe('solid');
    });

    it('should have consistent border radius', () => {
      const { cell, highlightedCell, subModuleCell } = permissionTableStyles;
      
      expect(cell.borderRadius).toBe('0px');
      expect(highlightedCell.borderRadius).toBe('0px');
      expect(subModuleCell.borderRadius).toBe('0px');
    });

    it('should have consistent box shadow', () => {
      const { cell, highlightedCell, subModuleCell } = permissionTableStyles;
      
      expect(cell.boxShadow).toBe('none');
      expect(highlightedCell.boxShadow).toBe('none');
      expect(subModuleCell.boxShadow).toBe('none');
    });
  });
});
