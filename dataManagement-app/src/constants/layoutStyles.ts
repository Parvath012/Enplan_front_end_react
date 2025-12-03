/**
 * Shared layout styles used across components
 */

export const COMMON_CONTAINER_STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    height: '100%',
    p: 0,
    width: '100%',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  contentBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    flex: 1,
    width: '100%',
    px: 0,
    position: 'relative' as const,
    height: 'auto',
    overflow: 'hidden' as const,
    border: 'none',
    borderBottom: 'none',
  },
  gridContainer: {
    width: '100%',
    flex: 1,
    mt: 0,
    overflow: 'hidden' as const,
    border: 'none',
    borderBottom: 'none',
  },
  gridWrapper: {
    height: '100%',
    width: '100%',
    boxSizing: 'border-box' as const,
    overflow: 'hidden' as const,
    overflowX: 'hidden' as const,
  },
} as const;

export const FLEX_COLUMN_LAYOUT = {
  display: 'flex',
  flexDirection: 'column' as const,
  height: '100%',
  width: '100%',
  overflow: 'hidden' as const,
} as const;

export const FLEX_AUTO_ITEM = {
  flex: '1 1 auto',
  overflow: 'hidden' as const,
  minHeight: 0,
  height: '100%',
} as const;

export const FLEX_FIXED_ITEM = {
  flex: '0 0 auto',
} as const;

