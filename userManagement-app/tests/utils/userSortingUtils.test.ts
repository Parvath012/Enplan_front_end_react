import {
  sortUsersByStatusAndName,
  filterUsersBySearchTerm,
  filterActiveUsers
} from '../../src/utils/userSortingUtils';

describe('userSortingUtils', () => {
  describe('sortUsersByStatusAndName', () => {
    it('should sort active users before inactive users', () => {
      const users = [
        { id: 1, firstname: 'John', lastname: 'Doe', status: 'Inactive' },
        { id: 2, firstname: 'Jane', lastname: 'Smith', status: 'Active' },
        { id: 3, firstname: 'Bob', lastname: 'Johnson', status: 'Inactive' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted[0].status).toBe('Active');
      expect(sorted[1].status).toBe('Inactive');
      expect(sorted[2].status).toBe('Inactive');
    });

    it('should sort by firstname alphabetically within same status', () => {
      const users = [
        { id: 1, firstname: 'Charlie', lastname: 'Brown', status: 'Active' },
        { id: 2, firstname: 'Alice', lastname: 'Smith', status: 'Active' },
        { id: 3, firstname: 'Bob', lastname: 'Johnson', status: 'Active' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted[0].firstname).toBe('Alice');
      expect(sorted[1].firstname).toBe('Bob');
      expect(sorted[2].firstname).toBe('Charlie');
    });

    it('should sort active users alphabetically, then inactive users alphabetically', () => {
      const users = [
        { id: 1, firstname: 'Zoe', lastname: 'Adams', status: 'Inactive' },
        { id: 2, firstname: 'Alice', lastname: 'Brown', status: 'Active' },
        { id: 3, firstname: 'Bob', lastname: 'Clark', status: 'Inactive' },
        { id: 4, firstname: 'Charlie', lastname: 'Davis', status: 'Active' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted[0].firstname).toBe('Alice');
      expect(sorted[0].status).toBe('Active');
      expect(sorted[1].firstname).toBe('Charlie');
      expect(sorted[1].status).toBe('Active');
      expect(sorted[2].firstname).toBe('Bob');
      expect(sorted[2].status).toBe('Inactive');
      expect(sorted[3].firstname).toBe('Zoe');
      expect(sorted[3].status).toBe('Inactive');
    });

    it('should handle empty array', () => {
      const users: any[] = [];
      const sorted = sortUsersByStatusAndName(users);

      expect(sorted).toEqual([]);
    });

    it('should handle single user', () => {
      const users = [
        { id: 1, firstname: 'John', lastname: 'Doe', status: 'Active' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted).toHaveLength(1);
      expect(sorted[0].firstname).toBe('John');
    });

    it('should handle users with same firstname', () => {
      const users = [
        { id: 1, firstname: 'John', lastname: 'Doe', status: 'Active' },
        { id: 2, firstname: 'John', lastname: 'Smith', status: 'Active' },
        { id: 3, firstname: 'John', lastname: 'Brown', status: 'Active' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted[0].firstname).toBe('John');
      expect(sorted[1].firstname).toBe('John');
      expect(sorted[2].firstname).toBe('John');
    });

    it('should handle case-insensitive sorting', () => {
      const users = [
        { id: 1, firstname: 'charlie', lastname: 'Brown', status: 'Active' },
        { id: 2, firstname: 'ALICE', lastname: 'Smith', status: 'Active' },
        { id: 3, firstname: 'Bob', lastname: 'Johnson', status: 'Active' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted[0].firstname).toBe('ALICE');
      expect(sorted[1].firstname).toBe('Bob');
      expect(sorted[2].firstname).toBe('charlie');
    });

    it('should handle users with null or undefined firstname', () => {
      const users = [
        { id: 1, firstname: null, lastname: 'Doe', status: 'Active' },
        { id: 2, firstname: 'Alice', lastname: 'Smith', status: 'Active' },
        { id: 3, firstname: undefined, lastname: 'Brown', status: 'Active' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted).toHaveLength(3);
      // Alice should be first alphabetically among defined names
      const aliceUser = sorted.find(u => u.firstname === 'Alice');
      expect(aliceUser).toBeDefined();
    });

    it('should not mutate original array', () => {
      const users = [
        { id: 1, firstname: 'Charlie', lastname: 'Brown', status: 'Active' },
        { id: 2, firstname: 'Alice', lastname: 'Smith', status: 'Active' }
      ];

      const originalOrder = [...users];
      sortUsersByStatusAndName(users);

      expect(users[0].firstname).toBe(originalOrder[0].firstname);
      expect(users[1].firstname).toBe(originalOrder[1].firstname);
    });

    it('should handle all inactive users', () => {
      const users = [
        { id: 1, firstname: 'Charlie', lastname: 'Brown', status: 'Inactive' },
        { id: 2, firstname: 'Alice', lastname: 'Smith', status: 'Inactive' },
        { id: 3, firstname: 'Bob', lastname: 'Johnson', status: 'Inactive' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted[0].firstname).toBe('Alice');
      expect(sorted[1].firstname).toBe('Bob');
      expect(sorted[2].firstname).toBe('Charlie');
    });

    it('should handle all active users', () => {
      const users = [
        { id: 1, firstname: 'Charlie', lastname: 'Brown', status: 'Active' },
        { id: 2, firstname: 'Alice', lastname: 'Smith', status: 'Active' },
        { id: 3, firstname: 'Bob', lastname: 'Johnson', status: 'Active' }
      ];

      const sorted = sortUsersByStatusAndName(users);

      expect(sorted[0].firstname).toBe('Alice');
      expect(sorted[1].firstname).toBe('Bob');
      expect(sorted[2].firstname).toBe('Charlie');
    });
  });

  describe('filterUsersBySearchTerm', () => {
    const users = [
      { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'Admin', department: 'IT' },
      { id: 2, firstname: 'Jane', lastname: 'Smith', emailid: 'jane@example.com', role: 'User', department: 'HR' },
      { id: 3, firstname: 'Bob', lastname: 'Johnson', emailid: 'bob@example.com', role: 'Manager', department: 'Sales' }
    ];

    it('should return all users when search term is empty', () => {
      const filtered = filterUsersBySearchTerm(users, '');

      expect(filtered).toHaveLength(3);
    });

    it('should filter by firstname', () => {
      const filtered = filterUsersBySearchTerm(users, 'John');

      expect(filtered).toHaveLength(2);
      expect(filtered[0].firstname).toBe('John');
      expect(filtered[1].lastname).toBe('Johnson');
    });

    it('should filter by lastname', () => {
      const filtered = filterUsersBySearchTerm(users, 'Smith');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].lastname).toBe('Smith');
    });

    it('should filter by email', () => {
      const filtered = filterUsersBySearchTerm(users, 'jane@example.com');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].emailid).toBe('jane@example.com');
    });

    it('should filter by role', () => {
      const filtered = filterUsersBySearchTerm(users, 'Admin');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].role).toBe('Admin');
    });

    it('should filter by department', () => {
      const filtered = filterUsersBySearchTerm(users, 'HR');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].department).toBe('HR');
    });

    it('should be case-insensitive', () => {
      const filtered = filterUsersBySearchTerm(users, 'JOHN');

      expect(filtered).toHaveLength(2);
    });

    it('should handle partial matches', () => {
      const filtered = filterUsersBySearchTerm(users, 'Jo');

      expect(filtered).toHaveLength(2);
    });

    it('should return empty array when no matches', () => {
      const filtered = filterUsersBySearchTerm(users, 'NonExistent');

      expect(filtered).toHaveLength(0);
    });

    it('should handle search term with spaces', () => {
      const filtered = filterUsersBySearchTerm(users, 'John Doe');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].firstname).toBe('John');
      expect(filtered[0].lastname).toBe('Doe');
    });

    it('should handle empty users array', () => {
      const filtered = filterUsersBySearchTerm([], 'test');

      expect(filtered).toHaveLength(0);
    });

    it('should handle null department', () => {
      const usersWithNullDept = [
        { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'Admin', department: null }
      ];

      const filtered = filterUsersBySearchTerm(usersWithNullDept, 'John');

      expect(filtered).toHaveLength(1);
    });

    it('should handle undefined department', () => {
      const usersWithUndefinedDept = [
        { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'Admin', department: undefined }
      ];

      const filtered = filterUsersBySearchTerm(usersWithUndefinedDept, 'John');

      expect(filtered).toHaveLength(1);
    });

    it('should filter by full name', () => {
      const filtered = filterUsersBySearchTerm(users, 'Jane Smith');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].firstname).toBe('Jane');
    });

    it('should handle special characters in search term', () => {
      const usersWithSpecialChars = [
        { id: 1, firstname: "O'Brien", lastname: 'Doe', emailid: 'obrien@example.com', role: 'Admin', department: 'IT' }
      ];

      const filtered = filterUsersBySearchTerm(usersWithSpecialChars, "O'Brien");

      expect(filtered).toHaveLength(1);
    });
  });

  describe('filterActiveUsers', () => {
    const users = [
      { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true, status: 'Active' },
      { id: 2, firstname: 'Jane', lastname: 'Smith', isenabled: false, status: 'Inactive' },
      { id: 3, firstname: 'Bob', lastname: 'Johnson', isenabled: true, status: 'Active' },
      { id: 4, firstname: 'Alice', lastname: 'Brown', isenabled: false, status: 'Inactive' }
    ];

    it('should return only active users', () => {
      const filtered = filterActiveUsers(users);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].status).toBe('Active');
      expect(filtered[1].status).toBe('Active');
    });

    it('should filter by both isenabled and status', () => {
      const filtered = filterActiveUsers(users);

      filtered.forEach(user => {
        expect(user.isenabled).toBe(true);
        expect(user.status).toBe('Active');
      });
    });

    it('should handle empty array', () => {
      const filtered = filterActiveUsers([]);

      expect(filtered).toHaveLength(0);
    });

    it('should handle all active users', () => {
      const allActive = [
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true, status: 'Active' },
        { id: 2, firstname: 'Jane', lastname: 'Smith', isenabled: true, status: 'Active' }
      ];

      const filtered = filterActiveUsers(allActive);

      expect(filtered).toHaveLength(2);
    });

    it('should handle all inactive users', () => {
      const allInactive = [
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false, status: 'Inactive' },
        { id: 2, firstname: 'Jane', lastname: 'Smith', isenabled: false, status: 'Inactive' }
      ];

      const filtered = filterActiveUsers(allInactive);

      expect(filtered).toHaveLength(0);
    });

    it('should filter out users with isenabled true but status Inactive', () => {
      const mixedUsers = [
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: true, status: 'Inactive' },
        { id: 2, firstname: 'Jane', lastname: 'Smith', isenabled: true, status: 'Active' }
      ];

      const filtered = filterActiveUsers(mixedUsers);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].firstname).toBe('Jane');
    });

    it('should filter out users with isenabled false but status Active', () => {
      const mixedUsers = [
        { id: 1, firstname: 'John', lastname: 'Doe', isenabled: false, status: 'Active' },
        { id: 2, firstname: 'Jane', lastname: 'Smith', isenabled: true, status: 'Active' }
      ];

      const filtered = filterActiveUsers(mixedUsers);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].firstname).toBe('Jane');
    });

    it('should not mutate original array', () => {
      const originalLength = users.length;
      filterActiveUsers(users);

      expect(users).toHaveLength(originalLength);
    });

    it('should return new array', () => {
      const filtered = filterActiveUsers(users);

      expect(filtered).not.toBe(users);
    });
  });

  describe('Integration Tests', () => {
    it('should work together: filter active users and sort them', () => {
      const users = [
        { id: 1, firstname: 'Charlie', lastname: 'Brown', isenabled: true, status: 'Active' },
        { id: 2, firstname: 'Alice', lastname: 'Smith', isenabled: false, status: 'Inactive' },
        { id: 3, firstname: 'Bob', lastname: 'Johnson', isenabled: true, status: 'Active' }
      ];

      const filtered = filterActiveUsers(users);
      const sorted = sortUsersByStatusAndName(filtered);

      expect(sorted).toHaveLength(2);
      expect(sorted[0].firstname).toBe('Bob');
      expect(sorted[1].firstname).toBe('Charlie');
    });

    it('should work together: search and sort users', () => {
      const users = [
        { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'Admin', department: 'IT', status: 'Inactive' },
        { id: 2, firstname: 'Jane', lastname: 'Johnson', emailid: 'jane@example.com', role: 'User', department: 'HR', status: 'Active' },
        { id: 3, firstname: 'Bob', lastname: 'Johnson', emailid: 'bob@example.com', role: 'Manager', department: 'Sales', status: 'Active' }
      ];

      const filtered = filterUsersBySearchTerm(users, 'Johnson');
      const sorted = sortUsersByStatusAndName(filtered);

      expect(sorted).toHaveLength(2);
      expect(sorted[0].status).toBe('Active');
      expect(sorted[0].firstname).toBe('Bob');
    });

    it('should work together: filter active, search, and sort', () => {
      const users = [
        { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'Admin', department: 'IT', isenabled: true, status: 'Active' },
        { id: 2, firstname: 'Jane', lastname: 'Smith', emailid: 'jane@example.com', role: 'User', department: 'IT', isenabled: false, status: 'Inactive' },
        { id: 3, firstname: 'Bob', lastname: 'Johnson', emailid: 'bob@example.com', role: 'Manager', department: 'IT', isenabled: true, status: 'Active' }
      ];

      const activeUsers = filterActiveUsers(users);
      const searchedUsers = filterUsersBySearchTerm(activeUsers, 'IT');
      const sortedUsers = sortUsersByStatusAndName(searchedUsers);

      expect(sortedUsers).toHaveLength(2);
      expect(sortedUsers[0].firstname).toBe('Bob');
      expect(sortedUsers[1].firstname).toBe('John');
    });
  });
});

