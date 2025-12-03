import React, { useState, useEffect, Suspense } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { Edit, TrashCan, View } from '@carbon/icons-react';
import { useDispatch } from 'react-redux';
// Module Federation imports
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip'));
const ToggleSwitch = React.lazy(() => import('commonApp/ToggleSwitch'));
import { EntityModel } from '../../services/entitySetupService';
import { updateEntityIsEnabled } from '../../store/Reducers/entitySlice';
import { getIconUrl } from 'commonApp/iconUtils';
import { ENTITY_LIST_STYLES } from '../../constants/entityListStyles';

interface ActionRendererProps {
  entity: EntityModel;
  onEdit: (id: number) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: any, current: boolean) => Promise<any>;
  onConfigureOrView: (entity: EntityModel) => void;
}

const ActionRenderer: React.FC<ActionRendererProps> = ({
  entity,
  onEdit,
  onDelete,
  onToggleEnabled,
  onConfigureOrView
}) => {
  const dispatch = useDispatch();
  
  // Local state for optimistic toggle updates
  const [localIsEnabled, setLocalIsEnabled] = useState(!!entity.isEnabled);

  // Update local state when entity prop changes
  useEffect(() => {
    setLocalIsEnabled(!!entity.isEnabled);
  }, [entity.isEnabled]);

  const handleToggle = async () => {
    const newIsEnabled = !localIsEnabled;
    const previousIsEnabled = localIsEnabled;
    
    // Optimistically update both local state and Redux store
    setLocalIsEnabled(newIsEnabled);
    dispatch(updateEntityIsEnabled({ 
      id: String(entity.id), 
      isEnabled: newIsEnabled 
    }));
    
    try {
      // Call the actual toggle function
      await onToggleEnabled(entity.id, previousIsEnabled);
    } catch (error) {
      // Revert both local state and Redux store on error
      setLocalIsEnabled(previousIsEnabled);
      dispatch(updateEntityIsEnabled({ 
        id: String(entity.id), 
        isEnabled: previousIsEnabled 
      }));
    }
  };

  return (
    <Box sx={ENTITY_LIST_STYLES.actionCell}>
      {/* Action Cell Body */}
      <Box sx={ENTITY_LIST_STYLES.actionCellBody} />

      {/* Edit Icon */}
      <Suspense fallback={<div></div>}>
        <CustomTooltip title="Edit" placement="bottom">
          <IconButton
            size="small"
            color="inherit"
            disabled={!!entity.isDeleted && !entity.isEnabled}
            onClick={() => onEdit(Number(entity.id))}
            sx={ENTITY_LIST_STYLES.editButton}
          >
            <Edit size={16} color="#5B6061" />
          </IconButton>
        </CustomTooltip>
      </Suspense>

      {/* Delete Icon */}
      {entity.isDeleted === false ? (
        <Suspense fallback={<div></div>}>
          <CustomTooltip title="Delete" placement="bottom">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(String(entity.id))}
              sx={ENTITY_LIST_STYLES.deleteButton}
            >
              <TrashCan size={16} color="#5B6061" />
            </IconButton>
          </CustomTooltip>
        </Suspense>
      ) : (
        <Suspense fallback={<div></div>}>
          <CustomTooltip title={localIsEnabled ? 'Enable' : 'Disable'} placement="bottom">
            <Box sx={ENTITY_LIST_STYLES.toggleSwitchContainer}>
              <Suspense fallback={<div></div>}>
                <ToggleSwitch 
                  isOn={localIsEnabled} 
                  handleToggle={handleToggle}
                  showPointerOnDisabled={false}
                />
              </Suspense>
            </Box>
          </CustomTooltip>
        </Suspense>
      )}

      {/* Configure Button with Icon */}
      <Suspense fallback={<div></div>}>
        <CustomTooltip title={entity.progressPercentage === '100' ? 'View' : 'Configure'} placement="bottom">
          <Button
            size="small"
            variant="text"
            color="inherit"
            disabled={!!entity.isDeleted && !entity.isEnabled}
            onClick={() => onConfigureOrView(entity)}
            startIcon={
              entity.progressPercentage === '100' ? (
                <View size={16} color="#5B6061" />
              ) : (
                <Box
                  component="img"
                  src={getIconUrl('tune_24dp_5B6061.svg')}
                  alt="Tune"
                  onError={(e) => {
                    console.error('Failed to load tune icon');
                    e.currentTarget.style.display = 'none';
                  }}
                  sx={{ width: 16, height: 16 }}
                />
              )
            }
            sx={ENTITY_LIST_STYLES.configureButton}
          >
            {entity.progressPercentage === '100' ? 'View' : 'Configure'}
          </Button>
        </CustomTooltip>
      </Suspense>
    </Box>
  );
};

export default ActionRenderer;
