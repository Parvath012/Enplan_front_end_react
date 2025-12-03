import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import ModuleCard from './ModuleCard';
import { fetchModules, saveEntityModulesAction } from '../../store/Actions/entitySetupActions';
import { parseModulesJson } from '../../services/entitySaveService';
import type { RootState } from '../../store/configureStore';
import './Modules.css';

interface ModulesProps {
  isEditMode?: boolean;
  entityId?: string;
  onModuleSave?: (modules: string[]) => void;
  onDataChange?: (modules: string[]) => void;
}

export interface ModulesRef {
  saveModulesToEntity: () => Promise<void>;
  resetModules: () => void;
}

const Modules = forwardRef<ModulesRef, ModulesProps>(({ isEditMode = true, entityId, onModuleSave, onDataChange }, ref) => {
  const dispatch = useDispatch();
  const { modules, loading, error } = useSelector((state: RootState) => state.entitySetup);
  const { items: entities } = useSelector((state: RootState) => state.entities);
  
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const hasLoadedSavedModules = useRef(false);
  const [showHorizontalScroll, setShowHorizontalScroll] = useState<boolean>(false);

  // Only show horizontal scrollbar when content actually overflows
  useEffect(() => {
    const checkOverflow = () => {
      // Use a timeout to ensure DOM is fully rendered
      setTimeout(() => {
        const container = document.querySelector('.modules-scroll-container');
        if (container) {
          const hasHorizontalOverflow = container.scrollWidth > container.clientWidth;
          setShowHorizontalScroll(hasHorizontalOverflow);
        }
      }, 100);
    };

    // Check on mount and when modules change
    checkOverflow();
    
    // Also check on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [modules]);

  // Load modules from Redux store
  useEffect(() => {
    if (modules.length === 0 && !loading) {
      dispatch(fetchModules() as any);
    }
  }, [dispatch, modules.length, loading]);

  // Reset the loaded flag when entityId changes
  useEffect(() => {
    hasLoadedSavedModules.current = false;
  }, [entityId]);

  // Load saved modules from entity data when entity changes
  useEffect(() => {
    if (entityId && entities.length > 0 && !hasLoadedSavedModules.current) {
      const currentEntity = entities.find(e => e.id === entityId);
      
      if (currentEntity?.modules) {
        const savedModules = parseModulesJson(currentEntity.modules);
        // Update selected modules state
        setSelectedModules(savedModules);
      } else {
        // If no saved modules, reset to default state
        setSelectedModules([]);
      }
      
      hasLoadedSavedModules.current = true;
    }
  }, [entityId, entities]);


  // Validate modules when selection changes
  useEffect(() => {
    if (selectedModules?.length > 10) {
      setValidationMessage('Too many modules enabled. Consider enabling only necessary modules.');
    } else {
      setValidationMessage(null);
    }
  }, [selectedModules]);

  const handleToggle = (moduleId: string, isEnabled: boolean) => {
    
    // Update local selected modules state
    let newSelectedModules: string[];
    if (isEnabled) {
      newSelectedModules = [...(selectedModules || []), moduleId];
    } else {
      newSelectedModules = (selectedModules || []).filter(id => id !== moduleId);
    }
    
    setSelectedModules(newSelectedModules);
    
    // Notify parent component of data change
    if (onDataChange) {
      onDataChange(newSelectedModules);
    }
  };

  const handleConfigure = (_moduleId: string) => {
    // Navigate to module-specific configuration page
    // Future implementation: navigate to module configuration page
    // navigate(`/entity/${entityId}/module/${_moduleId}/configure`);
  };

  // Save modules to entity table
  const saveModulesToEntity = async () => {
    
    if (!entityId) {
      console.error('Entity ID is required to save modules');
      return;
    }

    try {
      const activeModules = selectedModules;
      
      // @ts-ignore - Redux Toolkit async action
      dispatch(saveEntityModulesAction(entityId, activeModules));
      
      // Reset the loaded flag so that saved modules are reloaded when entities are refetched
      hasLoadedSavedModules.current = false;
      
      // Notify parent component
      if (onModuleSave) {
        onModuleSave(activeModules);
      }
      
    } catch (error) {
      console.error('Failed to save modules to entity:', error);
      throw error;
    }
  };

  // Reset modules to saved state
  const resetModules = () => {
    if (entityId && entities.length > 0) {
      const currentEntity = entities.find(e => e.id === entityId);
      if (currentEntity?.modules) {
        const savedModules = parseModulesJson(currentEntity.modules);
        setSelectedModules(savedModules);
        
        // Notify parent component of data change
        if (onDataChange) {
          onDataChange(savedModules);
        }
      } else {
        setSelectedModules([]);
        
        // Notify parent component of data change
        if (onDataChange) {
          onDataChange([]);
        }
      }
    }
  };

  // Expose functions to parent component via ref
  useImperativeHandle(ref, () => ({
    saveModulesToEntity,
    resetModules
  }), [saveModulesToEntity, resetModules]);



  if (loading) {
    return null;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      p: 0,
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      {/* Instruction text - moved to top */}
      <Typography
        variant="body2"
        sx={{
          fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '12px',
          color: '#5F6368',
          textAlign: 'left',
          lineHeight: '20px',
          mb: { xs: 1, sm: 1.5 },
          margin: '0px',
          textRendering: 'optimizeLegibility',
          fontFeatureSettings: '"kern" 1',
          WebkitFontFeatureSettings: '"kern"',
          MozFontFeatureSettings: '"kern"',
          fontKerning: 'normal',
        }}
      >
        Please select Module you want to enable in the system.
      </Typography>

      {/* Validation Message */}
      {validationMessage && (
        <Alert 
          severity={selectedModules.length === 0 ? "error" : "warning"} 
          sx={{ mb: 2 }}
        >
          {validationMessage}
        </Alert>
      )}

      {/* Modules List */}
      <Box 
        className="modules-scroll-container"
        sx={{ 
          mb: { xs: 2, sm: 3 },
          maxHeight: { xs: '60vh', sm: '70vh' },
          overflowY: 'auto',
          overflowX: 'hidden', // Hide horizontal scrollbar in container
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          backgroundColor: '#fff',
          p: { xs: 1, sm: 1.5 },
          width: '100%',
          marginLeft: 0,
          marginRight: 0,
          // Ensure content fits properly
          boxSizing: 'border-box',
        }}>
        {modules.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 3, sm: 4 },
              color: '#666',
            }}
          >
            <Typography variant="body2" sx={{ fontSize: { xs: '11px', sm: '12px' } }}>
              No modules available
            </Typography>
          </Box>
        ) : (
          modules.map((module, index) => {
            const isEnabled = selectedModules?.includes(module.id) || false;
            return (
              <ModuleCard
                key={module.id && module.id !== "0" ? module.id : `module-${index}`}
                module={{
                  ...module,
                  isEnabled: isEnabled
                }}
                isEditMode={isEditMode}
                onToggle={handleToggle}
                onConfigure={handleConfigure}
              />
            );
          })
        )}
      </Box>

      {/* Horizontal Scrollbar - only shown when content actually overflows horizontally */}
      {showHorizontalScroll && (
        <Box
          className="modules-horizontal-scroll"
          sx={{
            width: '100%',
            height: '8px',
            backgroundColor: '#f8f8f8',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            mt: 1,
            position: 'relative',
            overflow: 'hidden',
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '0px',
              width: '75%',
              height: '4px',
              backgroundColor: '#bdbdbd',
              borderRadius: '2px',
              transform: 'translateY(-50%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '2px',
              width: '0',
              height: '0',
              borderLeft: '2px solid transparent',
              borderRight: '2px solid transparent',
              borderBottom: '4px solid #757575',
              transform: 'translateY(-50%) rotate(90deg)',
            }}
          />
        </Box>
      )}

    </Box>
  );
});

Modules.displayName = 'Modules';

export default Modules;
