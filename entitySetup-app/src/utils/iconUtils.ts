// Icon utility functions for entitySetup-app

export const getIconUrl = (iconName: string): string => {
  // Check if we're in a test environment
  if (process.env.NODE_ENV === 'test') {
    return `/mock-icons/${iconName}`;
  }
  
  // Check if we're running under admin app path
  if (typeof window !== 'undefined' && window.location.pathname.includes('/admin/')) {
    return `http://remote:3005/icons/${iconName}`;
  }
  
  // Check if we're not on localhost
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `http://remote:3005/icons/${iconName}`;
  }
  
  // Default to local icons
  return `/icons/${iconName}`;
};

export const getIconPath = (iconName: string): string => {
  return getIconUrl(iconName);
};

export default getIconUrl;
