import { COLUMN_WIDTH_CONFIG, CONTROLLER_SERVICES_STYLES } from '../../src/constants/controllerServicesStyles';

describe('Controller Services Styles', () => {
  describe('COLUMN_WIDTH_CONFIG', () => {
    describe('small screen configuration', () => {
      it('should have small screen config', () => {
        expect(COLUMN_WIDTH_CONFIG.small).toBeDefined();
      });

      it('should have name column config', () => {
        expect(COLUMN_WIDTH_CONFIG.small.name).toEqual({
          minWidth: 220,
          maxWidth: 280,
          flex: 1
        });
      });

      it('should have type column config', () => {
        expect(COLUMN_WIDTH_CONFIG.small.type).toEqual({
          minWidth: 240,
          maxWidth: 300,
          flex: 2
        });
      });

      it('should have bundle column config', () => {
        expect(COLUMN_WIDTH_CONFIG.small.bundle).toEqual({
          minWidth: 180,
          maxWidth: 220,
          flex: 1
        });
      });

      it('should have state column config', () => {
        expect(COLUMN_WIDTH_CONFIG.small.state).toEqual({
          minWidth: 100,
          maxWidth: 100,
          flex: 0.5
        });
      });

      it('should have actions column config', () => {
        expect(COLUMN_WIDTH_CONFIG.small.actions).toEqual({
          minWidth: 140,
          maxWidth: 140,
          flex: 0.8
        });
      });
    });

    describe('medium screen configuration', () => {
      it('should have medium screen config', () => {
        expect(COLUMN_WIDTH_CONFIG.medium).toBeDefined();
      });

      it('should have name column config', () => {
        expect(COLUMN_WIDTH_CONFIG.medium.name).toEqual({
          minWidth: 240,
          maxWidth: 320,
          flex: 1
        });
      });

      it('should have type column config', () => {
        expect(COLUMN_WIDTH_CONFIG.medium.type).toEqual({
          minWidth: 260,
          maxWidth: 340,
          flex: 2
        });
      });

      it('should have bundle column config', () => {
        expect(COLUMN_WIDTH_CONFIG.medium.bundle).toEqual({
          minWidth: 200,
          maxWidth: 240,
          flex: 1
        });
      });

      it('should have state column config', () => {
        expect(COLUMN_WIDTH_CONFIG.medium.state).toEqual({
          minWidth: 100,
          maxWidth: 100,
          flex: 0.5
        });
      });

      it('should have actions column config', () => {
        expect(COLUMN_WIDTH_CONFIG.medium.actions).toEqual({
          minWidth: 140,
          maxWidth: 140,
          flex: 0.8
        });
      });
    });

    describe('large screen configuration', () => {
      it('should have large screen config', () => {
        expect(COLUMN_WIDTH_CONFIG.large).toBeDefined();
      });

      it('should have name column config', () => {
        expect(COLUMN_WIDTH_CONFIG.large.name).toEqual({
          minWidth: 280,
          maxWidth: 360,
          flex: 1
        });
      });

      it('should have type column config', () => {
        expect(COLUMN_WIDTH_CONFIG.large.type).toEqual({
          minWidth: 300,
          maxWidth: 400,
          flex: 2
        });
      });

      it('should have bundle column config', () => {
        expect(COLUMN_WIDTH_CONFIG.large.bundle).toEqual({
          minWidth: 240,
          maxWidth: 300,
          flex: 1
        });
      });

      it('should have state column config', () => {
        expect(COLUMN_WIDTH_CONFIG.large.state).toEqual({
          minWidth: 100,
          maxWidth: 100,
          flex: 0.5
        });
      });

      it('should have actions column config', () => {
        expect(COLUMN_WIDTH_CONFIG.large.actions).toEqual({
          minWidth: 160,
          maxWidth: 160,
          flex: 0.8
        });
      });
    });

    describe('column width progression', () => {
      it('should have increasing widths from small to large for name', () => {
        expect(COLUMN_WIDTH_CONFIG.small.name.minWidth).toBeLessThan(COLUMN_WIDTH_CONFIG.medium.name.minWidth);
        expect(COLUMN_WIDTH_CONFIG.medium.name.minWidth).toBeLessThan(COLUMN_WIDTH_CONFIG.large.name.minWidth);
      });

      it('should have increasing widths from small to large for type', () => {
        expect(COLUMN_WIDTH_CONFIG.small.type.minWidth).toBeLessThan(COLUMN_WIDTH_CONFIG.medium.type.minWidth);
        expect(COLUMN_WIDTH_CONFIG.medium.type.minWidth).toBeLessThan(COLUMN_WIDTH_CONFIG.large.type.minWidth);
      });

      it('should have increasing widths from small to large for bundle', () => {
        expect(COLUMN_WIDTH_CONFIG.small.bundle.minWidth).toBeLessThan(COLUMN_WIDTH_CONFIG.medium.bundle.minWidth);
        expect(COLUMN_WIDTH_CONFIG.medium.bundle.minWidth).toBeLessThan(COLUMN_WIDTH_CONFIG.large.bundle.minWidth);
      });

      it('should maintain consistent state width across sizes', () => {
        expect(COLUMN_WIDTH_CONFIG.small.state.minWidth).toBe(COLUMN_WIDTH_CONFIG.medium.state.minWidth);
        expect(COLUMN_WIDTH_CONFIG.medium.state.minWidth).toBe(COLUMN_WIDTH_CONFIG.large.state.minWidth);
      });
    });
  });

  describe('CONTROLLER_SERVICES_STYLES', () => {
    describe('container styles', () => {
      it('should have container styles defined', () => {
        expect(CONTROLLER_SERVICES_STYLES.container).toBeDefined();
      });

      it('should have correct display flex', () => {
        expect(CONTROLLER_SERVICES_STYLES.container.display).toBe('flex');
      });

      it('should have column flex direction', () => {
        expect(CONTROLLER_SERVICES_STYLES.container.flexDirection).toBe('column');
      });

      it('should have correct height calculation', () => {
        expect(CONTROLLER_SERVICES_STYLES.container.height).toBe('calc(100vh - 42px)');
      });

      it('should have no padding', () => {
        expect(CONTROLLER_SERVICES_STYLES.container.p).toBe(0);
      });

      it('should have 100% width', () => {
        expect(CONTROLLER_SERVICES_STYLES.container.width).toBe('100%');
      });

      it('should have relative position', () => {
        expect(CONTROLLER_SERVICES_STYLES.container.position).toBe('relative');
      });

      it('should have auto overflow', () => {
        expect(CONTROLLER_SERVICES_STYLES.container.overflow).toBe('auto');
      });
    });

    describe('contentBox styles', () => {
      it('should have contentBox styles defined', () => {
        expect(CONTROLLER_SERVICES_STYLES.contentBox).toBeDefined();
      });

      it('should have flex: 1', () => {
        expect(CONTROLLER_SERVICES_STYLES.contentBox.flex).toBe(1);
      });

      it('should have 100% width', () => {
        expect(CONTROLLER_SERVICES_STYLES.contentBox.width).toBe('100%');
      });

      it('should have auto height', () => {
        expect(CONTROLLER_SERVICES_STYLES.contentBox.height).toBe('auto');
      });
    });

    describe('gridContainer styles', () => {
      it('should have gridContainer styles defined', () => {
        expect(CONTROLLER_SERVICES_STYLES.gridContainer).toBeDefined();
      });

      it('should have correct border', () => {
        expect(CONTROLLER_SERVICES_STYLES.gridContainer.border).toBe('1px solid rgba(247, 247, 246, 1)');
      });

      it('should have border-box sizing', () => {
        expect(CONTROLLER_SERVICES_STYLES.gridContainer.boxSizing).toBe('border-box');
      });

      it('should have 100% max width', () => {
        expect(CONTROLLER_SERVICES_STYLES.gridContainer.maxWidth).toBe('100%');
      });
    });

    describe('actionCell styles', () => {
      it('should have actionCell styles defined', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCell).toBeDefined();
      });

      it('should have relative position', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCell.position).toBe('relative');
      });

      it('should have correct width', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCell.width).toBe('160px');
      });

      it('should have correct height', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCell.height).toBe('30px');
      });

      it('should have no padding', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCell.padding).toBe(0);
      });

      it('should have border-box sizing', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCell.boxSizing).toBe('border-box');
      });
    });

    describe('button styles', () => {
      it('should have editButton styles', () => {
        expect(CONTROLLER_SERVICES_STYLES.editButton).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.editButton.position).toBe('absolute');
        expect(CONTROLLER_SERVICES_STYLES.editButton.width).toBe('31px');
        expect(CONTROLLER_SERVICES_STYLES.editButton.height).toBe('22px');
      });

      it('should have deleteButton styles', () => {
        expect(CONTROLLER_SERVICES_STYLES.deleteButton).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.deleteButton.position).toBe('absolute');
        expect(CONTROLLER_SERVICES_STYLES.deleteButton.width).toBe(31);
        expect(CONTROLLER_SERVICES_STYLES.deleteButton.height).toBe(22);
      });

      it('should have toggleButton styles', () => {
        expect(CONTROLLER_SERVICES_STYLES.toggleButton).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.toggleButton.position).toBe('absolute');
        expect(CONTROLLER_SERVICES_STYLES.toggleButton.width).toBe('31px');
        expect(CONTROLLER_SERVICES_STYLES.toggleButton.height).toBe('22px');
      });

      it('should have detailsButton styles', () => {
        expect(CONTROLLER_SERVICES_STYLES.detailsButton).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.detailsButton.width).toBe('78px');
        expect(CONTROLLER_SERVICES_STYLES.detailsButton.textTransform).toBe('none');
      });

      it('should have viewButton styles', () => {
        expect(CONTROLLER_SERVICES_STYLES.viewButton).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.viewButton.position).toBe('absolute');
      });

      it('should have configureButton styles', () => {
        expect(CONTROLLER_SERVICES_STYLES.configureButton).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.configureButton.width).toBe('78px');
      });
    });

    describe('button positioning', () => {
      it('should have correct editButton position', () => {
        expect(CONTROLLER_SERVICES_STYLES.editButton.top).toBe('4px');
        expect(CONTROLLER_SERVICES_STYLES.editButton.left).toBe('4px');
      });

      it('should have correct deleteButton position', () => {
        expect(CONTROLLER_SERVICES_STYLES.deleteButton.top).toBe('4px');
        expect(CONTROLLER_SERVICES_STYLES.deleteButton.left).toBe('40px');
      });

      it('should have correct toggleButton position', () => {
        expect(CONTROLLER_SERVICES_STYLES.toggleButton.top).toBe('4px');
        expect(CONTROLLER_SERVICES_STYLES.toggleButton.left).toBe('75px');
      });

      it('should have correct detailsButton position', () => {
        expect(CONTROLLER_SERVICES_STYLES.detailsButton.top).toBe('4px');
        expect(CONTROLLER_SERVICES_STYLES.detailsButton.left).toBe('110px');
      });
    });

    describe('button hover states', () => {
      it('should have hover state for editButton', () => {
        expect(CONTROLLER_SERVICES_STYLES.editButton['&:hover']).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.editButton['&:hover'].backgroundColor).toBe('rgba(0,0,0,0.04)');
      });

      it('should have hover state for deleteButton', () => {
        expect(CONTROLLER_SERVICES_STYLES.deleteButton['&:hover']).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.deleteButton['&:hover'].backgroundColor).toBe('rgba(0,0,0,0.04)');
      });

      it('should have hover state for toggleButton', () => {
        expect(CONTROLLER_SERVICES_STYLES.toggleButton['&:hover']).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.toggleButton['&:hover'].backgroundColor).toBe('rgba(0,0,0,0.04)');
      });

      it('should have hover state for viewButton', () => {
        expect(CONTROLLER_SERVICES_STYLES.viewButton['&:hover']).toBeDefined();
        expect(CONTROLLER_SERVICES_STYLES.viewButton['&:hover'].backgroundColor).toBe('rgba(0,0,0,0.04)');
      });
    });

    describe('typography styles', () => {
      it('should have correct font family for detailsButton', () => {
        expect(CONTROLLER_SERVICES_STYLES.detailsButton.fontFamily).toBe("'InterTight-Regular', 'Inter Tight', sans-serif");
      });

      it('should have correct font size for detailsButton', () => {
        expect(CONTROLLER_SERVICES_STYLES.detailsButton.fontSize).toBe('10px');
      });

      it('should have correct font weight for detailsButton', () => {
        expect(CONTROLLER_SERVICES_STYLES.detailsButton.fontWeight).toBe(400);
      });

      it('should have correct color for detailsButton', () => {
        expect(CONTROLLER_SERVICES_STYLES.detailsButton.color).toBe('#5B6061');
      });
    });

    describe('toggleSwitch styles', () => {
      it('should have toggleSwitchContainer styles', () => {
        expect(CONTROLLER_SERVICES_STYLES.toggleSwitchContainer).toBeDefined();
      });

      it('should have correct dimensions', () => {
        expect(CONTROLLER_SERVICES_STYLES.toggleSwitchContainer.width).toBe(30);
        expect(CONTROLLER_SERVICES_STYLES.toggleSwitchContainer.height).toBe(14);
      });

      it('should have absolute positioning', () => {
        expect(CONTROLLER_SERVICES_STYLES.toggleSwitchContainer.position).toBe('absolute');
      });

      it('should have correct position coordinates', () => {
        expect(CONTROLLER_SERVICES_STYLES.toggleSwitchContainer.top).toBe('7px');
        expect(CONTROLLER_SERVICES_STYLES.toggleSwitchContainer.left).toBe('75px');
      });
    });

    describe('actionCellBody styles', () => {
      it('should have actionCellBody styles defined', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody).toBeDefined();
      });

      it('should have absolute positioning', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.position).toBe('absolute');
      });

      it('should cover entire action cell', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.top).toBe(0);
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.left).toBe(0);
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.width).toBe('160px');
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.height).toBe('30px');
      });

      it('should have correct border', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.borderStyle).toBe('solid');
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.borderColor).toBe('rgba(247, 247, 246, 1)');
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.borderWidth).toBe('0 1px 0 0');
      });

      it('should have flex display', () => {
        expect(CONTROLLER_SERVICES_STYLES.actionCellBody.display).toBe('flex');
      });
    });

    describe('header styles', () => {
      it('should have header styles defined', () => {
        expect(CONTROLLER_SERVICES_STYLES.header).toBeDefined();
      });

      it('should have space-between justification', () => {
        expect(CONTROLLER_SERVICES_STYLES.header.justifyContent).toBe('space-between');
      });

      it('should have center alignment', () => {
        expect(CONTROLLER_SERVICES_STYLES.header.alignItems).toBe('center');
      });

      it('should have flex display', () => {
        expect(CONTROLLER_SERVICES_STYLES.header.display).toBe('flex');
      });
    });
  });

  describe('Type Safety', () => {
    it('should export COLUMN_WIDTH_CONFIG as object', () => {
      expect(typeof COLUMN_WIDTH_CONFIG).toBe('object');
    });

    it('should export CONTROLLER_SERVICES_STYLES as object', () => {
      expect(typeof CONTROLLER_SERVICES_STYLES).toBe('object');
    });

    it('should not have null or undefined values in COLUMN_WIDTH_CONFIG', () => {
      const checkObject = (obj: any) => {
        Object.values(obj).forEach(value => {
          if (typeof value === 'object' && value !== null) {
            checkObject(value);
          } else {
            expect(value).not.toBeNull();
            expect(value).not.toBeUndefined();
          }
        });
      };
      checkObject(COLUMN_WIDTH_CONFIG);
    });
  });

  describe('Consistency', () => {
    it('should have consistent structure across screen sizes', () => {
      const smallKeys = Object.keys(COLUMN_WIDTH_CONFIG.small);
      const mediumKeys = Object.keys(COLUMN_WIDTH_CONFIG.medium);
      const largeKeys = Object.keys(COLUMN_WIDTH_CONFIG.large);

      expect(smallKeys).toEqual(mediumKeys);
      expect(mediumKeys).toEqual(largeKeys);
    });

    it('should have consistent properties for each column', () => {
      ['small', 'medium', 'large'].forEach(size => {
        ['name', 'type', 'bundle', 'state', 'actions'].forEach(column => {
          const config = COLUMN_WIDTH_CONFIG[size as keyof typeof COLUMN_WIDTH_CONFIG][column as keyof typeof COLUMN_WIDTH_CONFIG.small];
          expect(config).toHaveProperty('minWidth');
          expect(config).toHaveProperty('maxWidth');
          expect(config).toHaveProperty('flex');
        });
      });
    });
  });
});

