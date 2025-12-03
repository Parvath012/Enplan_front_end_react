import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleUserStatus, fetchUsers } from '../store/Reducers/userSlice';
import type { RootState } from '../store/configureStore';
import type { AgGridReact } from 'ag-grid-react';
import { parsePermissionsData } from '../utils/userFormUtils';
import { saveUserPartialUpdate } from '../services/userSaveService';

interface UseUserToggleReturn {
  togglingUsers: Set<number>;
  confirmDialog: {
    open: boolean;
    userId: number | null;
    userName: string;
    currentStatus: boolean;
  };
  setConfirmDialog: React.Dispatch<React.SetStateAction<{
    open: boolean;
    userId: number | null;
    userName: string;
    currentStatus: boolean;
  }>>;
  transferPanel: {
    open: boolean;
    userId: number | null;
    userName: string;
  };
  setTransferPanel: React.Dispatch<React.SetStateAction<{
    open: boolean;
    userId: number | null;
    userName: string;
  }>>;
  handleToggleStatus: (userId: number, currentStatus: boolean) => Promise<void>;
  handleConfirmYes: () => Promise<void>;
  handleConfirmNo: () => Promise<void>;
  handleTransferSubmit: (targetUserName: string) => Promise<boolean>;
  handleTransferReset: () => void;
}

/**
 * Custom hook for handling user status toggle logic
 */
export const useUserToggle = (gridRef: React.RefObject<AgGridReact<any>>): UseUserToggleReturn => {
  const dispatch = useDispatch();
  const { users } = useSelector((state: RootState) => state.users);
  const [togglingUsers, setTogglingUsers] = useState<Set<number>>(new Set());
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: null as number | null,
    userName: '',
    currentStatus: false
  });

  // Transfer panel state
  const [transferPanel, setTransferPanel] = useState({
    open: false,
    userId: null as number | null,
    userName: ''
  });

  // Helper function to prevent multiple rapid clicks
  const preventMultipleClicks = (userId: number): boolean => {
    if (togglingUsers.has(userId)) {
      console.log('Toggle already in progress for user:', userId);
      return true;
    }
    return false;
  };

  // Helper function to add user to toggling set
  const addUserToToggling = (userId: number) => {
    setTogglingUsers(prev => new Set(prev).add(userId));
  };

  // Helper function to remove user from toggling set
  const removeUserFromToggling = (userId: number) => {
    setTogglingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
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

  // Helper function to handle common toggle logic
  const executeToggle = async (
    userId: number, 
    toggleParams: { isEnabled: boolean; transferedby: string | null; transferedto: string | null; transfereddate: string | null },
    logMessage: string
  ): Promise<boolean> => {
    try {
      console.log(logMessage);
      console.log('User ID:', userId);
      console.log('New isenabled:', toggleParams.isEnabled);
      console.log('====================================');
      
      const result = await dispatch(toggleUserStatus({
        id: userId,
        isEnabled: toggleParams.isEnabled,
        transferedby: toggleParams.transferedby,
        transferedto: toggleParams.transferedto,
        transfereddate: toggleParams.transfereddate
      }) as any);
      
      if (result.type.endsWith('/fulfilled')) {
        console.log('✅ Toggle status updated successfully');
        console.log('✅ Database save confirmed for user:', userId);
        refreshGrid();
        return true;
      } else if (result.type.endsWith('/rejected')) {
        console.error('❌ Failed to update toggle status:', result.payload);
        alert('Failed to update user status. Please try again.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('❌ Error toggling user status:', error);
      alert('An error occurred while updating user status. Please try again.');
      return false;
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    const numericUserId = Number(userId);
    const user = users.find(u => u.id === numericUserId);
    // Format user name same way as in user list - use firstname + lastname, fallback to emailid, then 'Unknown User'
    const userName = user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.emailid || 'Unknown User' : 'Unknown User';
    
    // If going from Active to Inactive (Enable to Disable), show confirmation dialog
    if (currentStatus === true) {
      setConfirmDialog({
        open: true,
        userId: numericUserId,
        userName: userName,
        currentStatus: currentStatus
      });
    } else {
      // If going from Inactive to Active (Disable to Enable), directly toggle without popup
      await toggleUserStatusDirectly(numericUserId, currentStatus);
    }
  };

  const toggleUserStatusDirectly = async (userId: number, currentStatus: boolean) => {
    const numericUserId = userId;
    const newStatus = !currentStatus;
    
    // Prevent multiple rapid clicks
    if (preventMultipleClicks(numericUserId)) {
      return;
    }
    
    try {
      // Add user to toggling set
      addUserToToggling(numericUserId);
      
      const logMessage = `=== DIRECT TOGGLE STATUS HANDLER ===\nCurrent isenabled: ${currentStatus}\nNew isenabled: ${newStatus}\nNew status will be: ${newStatus ? 'Active' : 'Inactive'}\n${newStatus === true ? 'Clearing transferedby for user: ' + numericUserId : ''}`;
      
      // Execute toggle with appropriate parameters
      // When deactivating (newStatus = false), save timestamp for Status Info tooltip
      // When reactivating (newStatus = true), clear transfer fields
      await executeToggle(numericUserId, {
        isEnabled: newStatus,
        transferedby: null,
        transferedto: null,
        transfereddate: newStatus ? null : new Date().toISOString()
      }, logMessage);
      
    } finally {
      // Remove user from toggling set
      removeUserFromToggling(numericUserId);
    }
  };

  const handleConfirmYes = async () => {
    if (confirmDialog.userId === null) return;
   
    // Close confirmation dialog and open transfer panel
    // DO NOT execute toggle here - wait for user to select target user in the panel
    setConfirmDialog({ open: false, userId: null, userName: '', currentStatus: false });
    setTransferPanel({
      open: true,
      userId: confirmDialog.userId,
      userName: confirmDialog.userName
    });
    // The actual toggle with transfer will happen in handleTransferSubmit when user selects target user
  };

  // Helper function to find user by name
  const findUserByName = (userName: string) => {
    return users.find(user => {
      const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.emailid || '';
      return fullName === userName;
    });
  };

  // Helper function to merge permissions
  const mergePermissions = (
    sourcePermissions: string[],
    targetPermissions: string[]
  ): string[] => {
    const mergedSet = new Set<string>(targetPermissions);
    sourcePermissions.forEach((perm: string) => mergedSet.add(perm));
    return Array.from(mergedSet);
  };

  // Helper function to validate and set active module/submodule
  const validateActiveModuleAndSubmodule = (
    targetPermissions: ReturnType<typeof parsePermissionsData>,
    mergedEnabledModules: string[],
    mergedSelectedPermissions: string[]
  ): { activeModule: string | null; activeSubmodule: string | null } => {
    let activeModule = targetPermissions?.activeModule ?? null;
    let activeSubmodule = targetPermissions?.activeSubmodule ?? null;
    
    // Validate that activeModule exists in merged enabled modules
    if (!activeModule || !mergedEnabledModules.includes(activeModule)) {
      activeModule = mergedEnabledModules.length > 0 ? mergedEnabledModules[0] : null;
      console.log('Target activeModule invalid or missing, using:', activeModule);
    }
    
    // Validate that activeSubmodule belongs to the activeModule
    if (activeSubmodule && activeModule) {
      if (!activeSubmodule.startsWith(`${activeModule}-`)) {
        activeSubmodule = null;
        console.log('Target activeSubmodule does not match activeModule, resetting to null');
      } else {
        const hasSubmodulePermissions = mergedSelectedPermissions.some((perm: string) => 
          perm.startsWith(`${activeSubmodule}-`)
        );
        if (!hasSubmodulePermissions) {
          activeSubmodule = null;
          console.log('No permissions found for activeSubmodule, resetting to null');
        }
      }
    }
    
    return { activeModule, activeSubmodule };
  };

  const handleTransferSubmit = async (targetUserName: string): Promise<boolean> => {
    if (transferPanel.userId === null) return false;
    
    const numericUserId = transferPanel.userId;
    const newStatus = false; // Set to Inactive
   
    // Prevent multiple rapid clicks
    if (preventMultipleClicks(numericUserId)) {
      return false;
    }
   
    try {
      // Add user to toggling set
      addUserToToggling(numericUserId);
      
      // Step 1: Find source user
      const sourceUser = users.find(u => u.id === numericUserId);
      if (!sourceUser) {
        console.error('Source user not found:', numericUserId);
        return false;
      }
      
      // Step 2: Find target user by name
      const targetUser = findUserByName(targetUserName);
      if (!targetUser) {
        console.error('Target user not found:', targetUserName);
        return false;
      }
      
      // Step 3: Extract and merge permissions
      const sourcePermissions = parsePermissionsData(sourceUser.permissions);
      const sourceEnabledModules = sourcePermissions?.enabledModules ?? [];
      const sourceSelectedPermissions = sourcePermissions?.selectedPermissions ?? [];
      
      const targetPermissions = parsePermissionsData(targetUser.permissions);
      const targetEnabledModules = targetPermissions?.enabledModules ?? [];
      const targetSelectedPermissions = targetPermissions?.selectedPermissions ?? [];
      
      console.log('=== TRANSFER PERMISSIONS ===');
      console.log('Source user:', sourceUser.firstname, sourceUser.lastname, 'ID:', sourceUser.id);
      console.log('Target user:', targetUser.firstname, targetUser.lastname, 'ID:', targetUser.id);
      console.log('Source permissions:', sourceSelectedPermissions);
      console.log('Source enabled modules:', sourceEnabledModules);
      console.log('Target existing permissions:', targetSelectedPermissions);
      console.log('Target existing modules:', targetEnabledModules);
      
      // Step 4: Merge permissions
      const mergedSelectedPermissions = mergePermissions(sourceSelectedPermissions, targetSelectedPermissions);
      const mergedEnabledModules = mergePermissions(sourceEnabledModules, targetEnabledModules);
      
      console.log('Merged permissions:', mergedSelectedPermissions);
      console.log('Merged enabled modules:', mergedEnabledModules);
      
      // Step 5: Validate and set active module/submodule
      const { activeModule, activeSubmodule } = validateActiveModuleAndSubmodule(
        targetPermissions,
        mergedEnabledModules,
        mergedSelectedPermissions
      );
      
      // Step 6: Save updated permissions to target user
      const updatedPermissions = {
        activeModule,
        enabledModules: mergedEnabledModules,
        activeSubmodule,
        selectedPermissions: mergedSelectedPermissions
      };
      
      console.log('Final permissions to save:', JSON.stringify(updatedPermissions, null, 2));
      
      const targetUserId = targetUser.id;
      if (!targetUserId) {
        console.error('Target user ID is missing');
        return false;
      }
      
      await saveUserPartialUpdate({
        id: targetUserId.toString(),
        permissions: updatedPermissions,
        firstname: targetUser.firstname || '',
        lastname: targetUser.lastname || '',
        emailid: targetUser.emailid || '',
        role: targetUser.role || '',
        status: targetUser.status || 'Active',
        isenabled: targetUser.isenabled ?? true
      }, 'u');
      
      console.log('Permissions transferred successfully to target user');
      
      // Step 7: Execute toggle with transfer parameters for source user
      const logMessage = `=== TRANSFER RESPONSIBILITIES - SET TO INACTIVE WITH TRANSFER ===\nCurrent isenabled: true\nNew isenabled: ${newStatus}\nTransferring from: ${transferPanel.userName} to: ${targetUserName}`;
      
      const success = await executeToggle(numericUserId, {
        isEnabled: newStatus,
        transferedby: 'admin',
        transferedto: targetUserName,
        transfereddate: new Date().toISOString()
      }, logMessage);
      
      // Step 8: Refresh users list to show updated permissions
      if (success) {
        await dispatch(fetchUsers() as any);
        refreshGrid();
      }
      
      return success;
    } catch (error) {
      console.error('Error during transfer:', error);
      return false;
    } finally {
      // Remove user from toggling set
      removeUserFromToggling(numericUserId);
    }
  };

  const handleTransferReset = () => {
    // Just close the panel without saving
    setTransferPanel({ open: false, userId: null, userName: '' });
  };

  const handleConfirmNo = async () => {
    if (confirmDialog.userId === null) return;
   
    const numericUserId = confirmDialog.userId;
    // User chose "No" - set to Inactive with Shared icon and save to database
   
    // Prevent multiple rapid clicks
    if (preventMultipleClicks(numericUserId)) {
      return;
    }
   
    try {
      // Add user to toggling set
      addUserToToggling(numericUserId);
     
      const logMessage = `=== NO CHOICE - SET TO INACTIVE WITH SHARED ===\nSetting to Inactive (false) with Shared icon, no transferedby`;
     
      // Execute toggle to set as Inactive without transferedby
      // Save current timestamp in transfereddate so Status Info tooltip shows when user became inactive
      await executeToggle(numericUserId, {
        isEnabled: false,
        transferedby: null,
        transferedto: null,
        transfereddate: new Date().toISOString() // Save timestamp when user becomes inactive
      }, logMessage);
     
    } finally {
      // Remove user from toggling set
      removeUserFromToggling(numericUserId);
    }
   
    // Close dialog
    setConfirmDialog({ open: false, userId: null, userName: '', currentStatus: false });
  };

  return {
    togglingUsers,
    confirmDialog,
    setConfirmDialog,
    transferPanel,
    setTransferPanel,
    handleToggleStatus,
    handleConfirmYes,
    handleConfirmNo,
    handleTransferSubmit,
    handleTransferReset
  };
};

