import { createGridIcons, userListStyles, userTabs } from '../../src/constants/userListConstants';

describe('userListConstants', () => {
  describe('createGridIcons', () => {
    it('should create grid icons with correct properties', () => {
      const icons = createGridIcons();
      
      expect(icons).toHaveProperty('sortAscending');
      expect(icons).toHaveProperty('sortDescending');
      expect(icons).toHaveProperty('sortUnSort');
      
      // Check that all icons are strings (rendered markup)
      expect(typeof icons.sortAscending).toBe('string');
      expect(typeof icons.sortDescending).toBe('string');
      expect(typeof icons.sortUnSort).toBe('string');
      
      // Check that icons contain SVG elements
      expect(icons.sortAscending).toContain('<svg');
      expect(icons.sortDescending).toContain('<svg');
      expect(icons.sortUnSort).toContain('<svg');
    });

    it('should create different icons for different sort states', () => {
      const icons = createGridIcons();
      
      expect(icons.sortAscending).not.toBe(icons.sortDescending);
      expect(icons.sortDescending).not.toBe(icons.sortUnSort);
      expect(icons.sortAscending).not.toBe(icons.sortUnSort);
    });
  });

  describe('userListStyles', () => {
    it('should have correct container styles', () => {
      expect(userListStyles.container).toEqual({
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        height: 'calc(100vh - 42px)',
        p: 0,
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      });
    });

    it('should have correct contentBox styles', () => {
      expect(userListStyles.contentBox).toEqual({
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        flex: 1,
        width: '100%',
        px: 0,
        position: 'relative',
        height: 'auto',
      });
    });

    it('should have correct navigationBar styles', () => {
      expect(userListStyles.navigationBar).toEqual({
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(242, 242, 240, 1)',
        height: '34px',
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      });
    });

    it('should have correct navigationLeft styles', () => {
      expect(userListStyles.navigationLeft).toEqual({
        display: 'flex',
        alignItems: 'center',
      });
    });

    it('should have correct tabContainer styles', () => {
      expect(userListStyles.tabContainer).toEqual({
        display: 'flex',
        alignItems: 'center',
      });
    });

    it('should have correct tabContent styles', () => {
      expect(userListStyles.tabContent).toEqual({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
      });
    });

    it('should have correct tabPanel styles', () => {
      expect(userListStyles.tabPanel).toEqual({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
      });
    });

    it('should have correct gridContainer styles', () => {
      expect(userListStyles.gridContainer).toEqual({
        width: '100%',
        flex: 1,
        mt: 0,
        overflow: 'visible'
      });
    });

    it('should have correct gridWrapper styles', () => {
      expect(userListStyles.gridWrapper).toEqual({
        height: 'calc(100vh - 200px)',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'visible'
      });
    });
  });

  describe('userTabs', () => {
    it('should have correct tab configuration', () => {
      expect(userTabs).toHaveLength(4);
      
      expect(userTabs[0]).toEqual({
        label: 'Users',
        index: 0,
        marginLeft: '-18px'
      });
      
      expect(userTabs[1]).toEqual({
        label: 'Roles and Permissions',
        index: 1,
        marginLeft: '20px'
      });
      
      expect(userTabs[2]).toEqual({
        label: 'Team/Group',
        index: 2,
        marginLeft: '20px'
      });
      
      expect(userTabs[3]).toEqual({
        label: 'Reporting Structure',
        index: 3,
        marginLeft: '20px'
      });
    });

    it('should have sequential indices', () => {
      userTabs.forEach((tab, index) => {
        expect(tab.index).toBe(index);
      });
    });

    it('should have all required properties for each tab', () => {
      userTabs.forEach(tab => {
        expect(tab).toHaveProperty('label');
        expect(tab).toHaveProperty('index');
        expect(tab).toHaveProperty('marginLeft');
        expect(typeof tab.label).toBe('string');
        expect(typeof tab.index).toBe('number');
        expect(typeof tab.marginLeft).toBe('string');
      });
    });
  });
});
