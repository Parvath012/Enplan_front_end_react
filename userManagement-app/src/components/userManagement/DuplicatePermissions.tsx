import React, { useState } from 'react';
import { Replicate } from '@carbon/icons-react';
import NotificationAlert from 'commonApp/NotificationAlert';
import CommonButton from './CommonButton';
import CommonTextSpan from './CommonTextSpan';
import DuplicatePermissionPanel from './DuplicatePermissionPanel';

import type { User } from '../../services/userService';

interface DuplicatePermissionsProps {
  onDuplicate: (duplicatedPermissions: string[], duplicatedEnabledModules?: string[]) => void;
  users: Array<{ id: string; name: string; email: string }>;
  fullUsers?: User[]; // Full user objects with permissions
  modules: string[];
  modulesData?: { [key: string]: { submodules: { [key: string]: string[] } } };
  currentUser?: { firstName: string; lastName: string; emailId: string };
  onSuccessNotification?: (message: string) => void;
}

const DuplicatePermissions: React.FC<DuplicatePermissionsProps> = ({
  onDuplicate,
  users,
  fullUsers,
  modules,
  modulesData,
  currentUser,
  onSuccessNotification
}) => {
  // Duplicate warning dialog state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  // Duplicate panel state
  const [duplicatePanelOpen, setDuplicatePanelOpen] = useState(false);

  // Duplicate handlers
  const handleDuplicateClick = () => {
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirmYes = () => {
    // Close the warning dialog and open the duplicate panel
    setDuplicateDialogOpen(false);
    setDuplicatePanelOpen(true);
  };

  const handleDuplicateConfirmNo = () => {
    setDuplicateDialogOpen(false);
  };

  // Panel handlers
  const handlePanelClose = () => {
    setDuplicatePanelOpen(false);
  };

  const handlePanelDuplicate = (sourceUser: string, targetUser: string, selectedModules: string[], duplicatedPermissions: string[], enabledModules: string[]) => {
    // Call the parent component's onDuplicate handler with both permissions and enabled modules
    // We need to update the signature to pass both
    onDuplicate(duplicatedPermissions, enabledModules);
    
    console.log('Permissions duplicated from', sourceUser, 'to', targetUser, 'for modules:', selectedModules);
    console.log('Duplicated permissions:', duplicatedPermissions);
    console.log('Enabled modules:', enabledModules);
  };

  return (
    <>
      {/* Duplicate Button */}
      <CommonButton onClick={handleDuplicateClick}>
        <Replicate color='white' size={16} style={{ marginRight: '6px' }} />
        <CommonTextSpan>
          Duplicate
        </CommonTextSpan>
      </CommonButton>

      {/* Duplicate Warning Dialog */}
      <NotificationAlert
        open={duplicateDialogOpen}
        variant="warning"
        title="Warning – Action Required"
        message="The selected permissions will be duplicated and added to the existing permissions. Do you wish to continue?"
        onClose={handleDuplicateConfirmNo}
        actions={[
          { label: 'No', onClick: handleDuplicateConfirmNo, emphasis: 'secondary' },
          { label: 'Yes', onClick: handleDuplicateConfirmYes, emphasis: 'primary' },
        ]}
      />

      {/* Duplicate Permission Panel */}
      <DuplicatePermissionPanel
        isOpen={duplicatePanelOpen}
        onClose={handlePanelClose}
        onDuplicate={handlePanelDuplicate}
        users={users}
        fullUsers={fullUsers}
        modules={modules}
        modulesData={modulesData}
        currentUser={currentUser}
        onSuccessNotification={onSuccessNotification}
      />
    </>
  );
};

export default DuplicatePermissions;
