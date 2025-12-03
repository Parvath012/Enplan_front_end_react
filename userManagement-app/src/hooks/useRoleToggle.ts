import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleRoleStatus, fetchRoles } from '../store/Reducers/roleSlice';
import type { AgGridReact } from 'ag-grid-react';

interface UseRoleToggleReturn {
  togglingRoles: Set<number>;
  handleToggleStatus: (roleId: number, currentStatus: boolean) => Promise<void>;
}

/**
 * Custom hook for handling role status toggle logic
 */
export const useRoleToggle = (gridRef: React.RefObject<AgGridReact<any>>): UseRoleToggleReturn => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();
  const [togglingRoles, setTogglingRoles] = useState<Set<number>>(new Set());

  // Helper function to prevent multiple rapid clicks
  const preventMultipleClicks = (roleId: number): boolean => {
    if (togglingRoles.has(roleId)) {
      console.log('Toggle already in progress for role:', roleId);
      return true;
    }
    return false;
  };

  // Helper function to add role to toggling set
  const addRoleToToggling = (roleId: number) => {
    setTogglingRoles(prev => new Set(prev).add(roleId));
  };

  // Helper function to remove role from toggling set
  const removeRoleFromToggling = (roleId: number) => {
    setTogglingRoles(prev => {
      const newSet = new Set(prev);
      newSet.delete(roleId);
      return newSet;
    });
  };

  // Helper function to refresh grid
  const refreshGrid = () => {
    setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.api.refreshCells({ force: true });
      }
    }, 100);
  };

  const handleToggleStatus = async (roleId: number, currentStatus: boolean) => {
    const numericRoleId = Number(roleId);
    const newStatus = !currentStatus;
    
    // Prevent multiple rapid clicks
    if (preventMultipleClicks(numericRoleId)) {
      return;
    }
    
    try {
      // Add role to toggling set
      addRoleToToggling(numericRoleId);
      
      console.log('=== TOGGLE ROLE STATUS ===');
      console.log('Role ID:', numericRoleId);
      console.log('Current isenabled:', currentStatus);
      console.log('New isenabled:', newStatus);
      console.log('New status will be:', newStatus ? 'Active' : 'Inactive');
      console.log('================================');
      
      await dispatch(toggleRoleStatus({
        id: numericRoleId,
        isEnabled: newStatus
      })).unwrap();
      
      console.log('✅ Toggle status updated successfully');
      console.log('✅ Database save confirmed for role:', numericRoleId);
      // Refresh roles from database to get updated data
      dispatch(fetchRoles()).then(() => {
        refreshGrid();
      });
    } catch (error) {
      console.error('❌ Error toggling role status:', error);
      alert('An error occurred while updating role status. Please try again.');
    } finally {
      // Remove role from toggling set
      removeRoleFromToggling(numericRoleId);
    }
  };

  return {
    togglingRoles,
    handleToggleStatus
  };
};

