export const DRAWER_STYLES = {
  '& .MuiDrawer-paper': {
    width: '100%',
    maxWidth: '1400px',
    height: '100%',
    maxHeight: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingTop: '40px',
    paddingLeft: '50px',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
    bgcolor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto',
  },
  zIndex: 900,
};

export const HEADER_STYLES = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backgroundColor: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  width: '100%',
  height: '40px',
  minHeight: '40px',
  flexShrink: 0,
  borderBottom: '1px solid #e0e0e0',
};

export const ADMIN_HEADER_STYLES = {
  position: 'sticky',
  top: 0,
  zIndex: 1001,
};

// Re-export shared hierarchy styles for backward compatibility
export {
  MAIN_CONTENT_STYLES,
  REACT_FLOW_CONTAINER_STYLES,
  ZOOM_CONTAINER_STYLES,
  CURSOR_OVERRIDE_STYLES
} from 'commonApp/hierarchyConstants';
