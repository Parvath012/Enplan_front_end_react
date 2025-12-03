/**
 * Utility functions for user-related operations
 */

export interface User {
  id?: number;
  firstname: string;
  lastname: string;
  isenabled?: boolean;
  status?: string;
}

/**
 * Get full name from user
 */
export function getUserFullName(user: User): string {
  return `${user.firstname} ${user.lastname}`.trim();
}

/**
 * Get active users (enabled and not inactive)
 */
export function getActiveUsers(users: User[]): User[] {
  return users.filter(user => user.isenabled && user.status !== 'Inactive');
}

/**
 * Create a map of user IDs by full name
 */
export function createUserMapByName(users: User[]): Map<string, number> {
  const map = new Map<string, number>();
  users.forEach(user => {
    if (user.id) {
      const fullName = getUserFullName(user);
      map.set(fullName, user.id);
    }
  });
  return map;
}

/**
 * Create user options array for dropdowns
 */
export function createUserOptions(users: User[]): string[] {
  return users.map(user => getUserFullName(user));
}

