export const getIconUrl = (iconName: string): string => {
  // Check if we're in a remote module context (admin app)
  // Use pathname check for production compatibility (works regardless of port)
  const isRemoteModule = window.location.port === '3000' || 
                         window.location.pathname.startsWith('/admin');
  
  // Determine which app we're serving based on the current path
  // Check for user-management in pathname (more flexible matching)
  const isUserManagement = window.location.pathname.includes('user-management');
  const isEntitySetup = window.location.pathname.includes('entity-setup');
  
  // When in remote module context, ALWAYS derive from current location
  // This ensures it works in production regardless of build-time env vars
  if (isRemoteModule) {
    const origin = window.location.origin; // e.g., "http://172.16.20.116:3000"
    
    if (isUserManagement) {
      // Derive user management app URL from current origin
      const appUrl = origin.replace(':3000', ':3006');
      return `${appUrl}/icons/${iconName}`;
    } else if (isEntitySetup) {
      // Derive entity setup app URL from current origin
      const appUrl = origin.replace(':3000', ':3005');
      return `${appUrl}/icons/${iconName}`;
    }
    // If in admin context but app not detected, use admin app's origin
    // This handles any other icons in admin app
    return `${origin}/icons/${iconName}`;
  }
  
  // Standalone mode: use relative path (works for standalone deployments)
  return `/icons/${iconName}`;
};

export default getIconUrl;
