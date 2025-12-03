/**
 * Sort users by status (Active first) and then by firstname
 * This matches the backend ordering configuration
 */
export const sortUsersByStatusAndName = (users: any[]): any[] => {
  return [...users].sort((a, b) => {
    // First sort by status (Active before Inactive)
    const statusA = a.status === 'Active' ? 0 : 1;
    const statusB = b.status === 'Active' ? 0 : 1;
    
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    
    // Then sort by firstname alphabetically
    const nameA = (a.firstname || '').toLowerCase();
    const nameB = (b.firstname || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

/**
 * Filter users based on search term
 */
export const filterUsersBySearchTerm = (users: any[], searchTerm: string): any[] => {
  if (!searchTerm) return users;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return users.filter(user =>
    `${user.firstname} ${user.lastname}`.toLowerCase().includes(lowerSearchTerm) ||
    user.emailid.toLowerCase().includes(lowerSearchTerm) ||
    user.role.toLowerCase().includes(lowerSearchTerm) ||
    (user.department?.toLowerCase().includes(lowerSearchTerm))
  );
};

/**
 * Filter users to show only active ones
 */
export const filterActiveUsers = (users: any[]): any[] => {
  return users.filter(user => user.isenabled && user.status === 'Active');
};

