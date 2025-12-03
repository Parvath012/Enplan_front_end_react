/**
 * Common drawer styles and configurations
 * Used to reduce duplication across drawer components
 */

export const COMMON_DRAWER_STYLES = {
  /**
   * Standard drawer configuration for 588px wide drawers
   * Used by EditControllerServiceDrawer and EnableDisableControllerServiceDrawer
   */
  standardDrawer: {
    width: '588px',
    height: '100vh',
    maxWidth: '588px',
    maxHeight: '100vh',
    position: 'absolute',
    right: '0px',
    top: '0px',
    left: 'auto',
    bottom: '0px',
  },
  /**
   * Standard drawer sx styles for 588px drawers
   */
  standardDrawerSx: {
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
    },
    '& .MuiDrawer-paper': {
      backdropFilter: 'none !important',
      WebkitBackdropFilter: 'none !important',
      filter: 'none !important',
      position: 'absolute !important',
      right: '0px !important',
      top: '0px !important',
      left: 'auto !important',
      bottom: '0px !important',
      width: '588px !important',
      height: '100vh !important',
      maxWidth: '588px !important',
      maxHeight: '100vh !important',
      overflowX: 'hidden !important',
      background: '#fafafa',
      backgroundColor: '#fafafa',
      boxSizing: 'border-box',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(242, 242, 240, 1)',
      borderTop: '0px',
      borderRadius: '0px',
      borderTopLeftRadius: '0px',
      borderTopRightRadius: '0px',
      boxShadow: '-5px 0px 14px rgba(204, 204, 204, 0.349019607843137)',
      MozBoxShadow: '-5px 0px 14px rgba(204, 204, 204, 0.349019607843137)',
      WebkitBoxShadow: '-5px 0px 14px rgba(204, 204, 204, 0.349019607843137)',
    },
  },
};


