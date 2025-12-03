import React, { useState, useEffect } from 'react';
import { Typography, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon, ChevronDown, ChevronRight, WarningAlt, Play, InformationFilled, Exit } from '@carbon/icons-react';
import './EnableDisableControllerServiceDrawer.scss';

// Import CustomTooltip from common-app with fallback
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip').catch(err => {
  console.error('Failed to load CustomTooltip from common-app:', err);
  return { 
    default: ({ children, title }: any) => <div title={title}>{children}</div>
  };
}));

// Import SelectField from common-app
const SelectField = React.lazy(() => import('commonApp/SelectField').catch(err => {
  console.error('Failed to load SelectField from common-app:', err);
  return { default: () => <div>SelectField failed to load</div> };
}));

// Import TextField from common-app
const TextField = React.lazy(() => import('commonApp/TextField').catch(err => {
  console.error('Failed to load TextField from common-app:', err);
  return { default: () => <div>TextField failed to load</div> };
}));

// Import ReusablePanel
const ReusablePanel = React.lazy(() => import('./common/ReusablePanel').catch(err => {
  console.error('Failed to load ReusablePanel:', err);
  return { 
    default: () => <div>ReusablePanel failed to load</div>
  };
}));

import { nifiApiService } from '../api/nifi/nifiApiService';

interface ReferencingComponent {
  id: string;
  name: string;
  type: string;
  state: 'RUNNING' | 'STOPPED' | 'INVALID' | 'DISABLED';
  groupId?: string;
}

interface EnableDisableControllerServiceDrawerProps {
  open: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    state: string;
  } | null;
  action: 'enable' | 'disable';
  onConfirm: () => void;
}

const EnableDisableControllerServiceDrawer: React.FC<EnableDisableControllerServiceDrawerProps> = ({
  open,
  onClose,
  service,
  action,
  onConfirm
}) => {
  // Static referencing components data
  const staticReferencingComponents: ReferencingComponent[] = [
    {
      id: 'processor-1',
      name: 'Convert Record',
      type: 'PROCESSOR',
      state: 'INVALID',
      groupId: undefined
    },
    {
      id: 'processor-2',
      name: 'Put File',
      type: 'PROCESSOR',
      state: 'RUNNING',
      groupId: undefined
    }
  ];

  const [isProcessorsExpanded, setIsProcessorsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scope, setScope] = useState<'service-only' | 'service-and-referencing'>('service-only');
  const [referencingComponents, setReferencingComponents] = useState<ReferencingComponent[]>([]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setIsProcessorsExpanded(true);
      setError(null);
      setScope('service-only');
      setReferencingComponents([]);
    }
  }, [open]);

  // Fetch referencing components when drawer opens
  useEffect(() => {
    if (!open || !service?.id) return;
    
    if (action === 'enable') {
      // Fetch actual referencing components from API when available
      // For now, using empty array to show "No referencing components"
      setReferencingComponents([]);
    } else if (action === 'disable') {
      // For disable, use static data
      setReferencingComponents(staticReferencingComponents);
    }
  }, [open, action, service?.id]);

  const handleConfirm = async () => {
    if (!service) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // First get the current service details to get revision
      const serviceDetails = await nifiApiService.getControllerService(service.id);
      const revision = {
        version: serviceDetails.revision?.version || 0,
        clientId: serviceDetails.revision?.clientId
      };

      if (action === 'disable') {
        // For disable: First stop referencing components, then disable the service
        console.log('Disabling controller service - stopping referencing components first...');
        await nifiApiService.updateControllerServiceReferences(service.id, 'STOPPED', {});
        
        console.log('Disabling controller service...');
        await nifiApiService.disableControllerService(service.id, revision);
      } else {
        // For enable: Enable the service
        console.log('Enabling controller service...');
        await nifiApiService.enableControllerService(service.id, revision);
        
        // If scope is "service-and-referencing", start referencing components
        if (scope === 'service-and-referencing') {
          console.log('Starting referencing components...');
          try {
            await nifiApiService.updateControllerServiceReferences(service.id, 'RUNNING', {});
          } catch (refError: any) {
            // Log but don't fail if starting references fails - service is already enabled
            console.warn('Failed to start referencing components, but service is enabled:', refError);
          }
        }
      }

      // Call parent callback to refresh the list
      onConfirm();
      onClose();
    } catch (err: any) {
      console.error(`Failed to ${action} controller service:`, err);
      setError(err.message || `Failed to ${action} controller service`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStateIcon = (state: string) => {
    switch (state?.toUpperCase()) {
      case 'INVALID':
      case 'DISABLED':
        return <WarningAlt size={16} style={{ color: '#6c757d' }} />;
      case 'RUNNING':
      case 'ENABLED':
        return <Play size={16} style={{ color: '#6c757d' }} />;
      default:
        return <WarningAlt size={16} style={{ color: '#6c757d' }} />;
    }
  };


  const actionTitle = action === 'enable' ? 'Enable Controller Service' : 'Disable Controller Service';
  const buttonText = action === 'enable' ? 'Enable' : 'Disable';

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ReusablePanel
        isOpen={open}
        onClose={onClose}
        title="" // Empty title - we use custom header
        width="588px"
        backgroundColor="#ffffff"
        showResetButton={false}
        showSubmitButton={false}
        customClassName="enable-disable-drawer-panel"
      >
        <div className="enable-disable-drawer">
        {/* Header */}
        <div className="enable-disable-drawer__header">
          <Typography 
            variant="h6" 
            className="enable-disable-drawer__title"
          >
            {actionTitle}
          </Typography>
          <React.Suspense fallback={
            <IconButton 
              onClick={onClose}
              className="enable-disable-drawer__close-button"
              size="small"
              aria-label="Close"
              disableRipple
            >
              <CloseIcon size={22} />
            </IconButton>
          }>
            <CustomTooltip title="Close" placement="bottom" arrow={false} followCursor={true}>
              <IconButton 
                onClick={onClose}
                className="enable-disable-drawer__close-button"
                aria-label="Close"
                disableRipple
              >
                <CloseIcon size={22} />
              </IconButton>
            </CustomTooltip>
          </React.Suspense>
        </div>

        {/* Content */}
        <div className="enable-disable-drawer__content">
          {/* Service and Referencing Components Row */}
          <div className="enable-disable-drawer__fields-row">
            {/* Service Field */}
            <div className="enable-disable-drawer__field">
              <React.Suspense fallback={
                <div>
                  <label htmlFor="service-name-input" className="enable-disable-drawer__label">Service</label>
                  <div className="enable-disable-drawer__service-input">
                    <input
                      id="service-name-input"
                      type="text"
                      value={service?.name ?? ''}
                      readOnly
                      className="enable-disable-drawer__input"
                      aria-label="Service name"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              }>
                <TextField
                  label="Service"
                  value={service?.name ?? ''}
                  onChange={() => {}} // No-op since it's read-only
                  readOnly={true}
                  placeholder=""
                />
              </React.Suspense>
              {/* Scope Section */}
              <div className="enable-disable-drawer__scope-field">
                {action === 'enable' ? (
                  <React.Suspense fallback={
                    <div>
                      <label htmlFor="scope-select" className="enable-disable-drawer__label">Scope*</label>
                      <select 
                        id="scope-select"
                        value={scope}
                        onChange={(e) => setScope(e.target.value as 'service-only' | 'service-and-referencing')}
                        className="enable-disable-drawer__scope-select"
                      >
                        <option value="service-only">Service only</option>
                        <option value="service-and-referencing">Service and referencing components</option>
                      </select>
                    </div>
                  }>
                    <SelectField
                      label="Scope*"
                      value={scope === 'service-only' ? 'Service only' : 'Service and referencing components'}
                      onChange={(value: string) => {
                        setScope(value === 'Service only' ? 'service-only' : 'service-and-referencing');
                      }}
                      options={['Service only', 'Service and referencing components']}
                      placeholder="Select scope"
                    />
                  </React.Suspense>
                ) : (
                  <React.Suspense fallback={
                    <div>
                      <label htmlFor="scope-text" className="enable-disable-drawer__label">Scope*</label>
                      <div className="enable-disable-drawer__service-input">
                        <input
                          id="scope-text"
                          type="text"
                          value="Service and referencing components"
                          readOnly
                          className="enable-disable-drawer__input"
                          aria-label="Scope"
                          tabIndex={-1}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => e.preventDefault()}
                        />
                      </div>
                    </div>
                  }>
                    <TextField
                      label="Scope*"
                      value="Service and referencing components"
                      onChange={() => {}} // No-op since it's read-only
                      readOnly={true}
                      placeholder=""
                    />
                  </React.Suspense>
                )}
              </div>
            </div>

            {/* Referencing Components Section */}
              <div className="enable-disable-drawer__field">
                <div className="enable-disable-drawer__label-row">
                  <label htmlFor="referencing-components-list" className="enable-disable-drawer__label">Referencing Components</label>
                <React.Suspense fallback={
                  <button className="enable-disable-drawer__info-icon-button" aria-label="Referencing components information">
                    <InformationFilled size={14} />
                  </button>
                }>
                  <CustomTooltip title="Other components referencing this controller service." placement="bottom" followCursor={false} arrow={false} enterDelay={500}>
                    <button className="enable-disable-drawer__info-icon-button" aria-label="Referencing components information">
                      <InformationFilled size={14} />
                    </button>
                  </CustomTooltip>
                </React.Suspense>
              </div>
              <div className="enable-disable-drawer__components-list">
              {referencingComponents.length > 0 ? (
                <>
                  {/* Processors Section */}
                  <button
                    type="button"
                    className="enable-disable-drawer__collapse-header"
                    onClick={() => setIsProcessorsExpanded(!isProcessorsExpanded)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsProcessorsExpanded(!isProcessorsExpanded);
                      }
                    }}
                    aria-expanded={isProcessorsExpanded}
                    aria-label="Toggle processors list"
                  >
                    {isProcessorsExpanded ? (
                      <ChevronDown size={12} className="enable-disable-drawer__chevron" />
                    ) : (
                      <ChevronRight size={12} className="enable-disable-drawer__chevron" />
                    )}
                    <span className="enable-disable-drawer__collapse-title">
                      Processors ({referencingComponents.length})
                    </span>
                  </button>
                  <Collapse in={isProcessorsExpanded}>
                    <ul className="enable-disable-drawer__components-items">
                      {referencingComponents.map((component) => (
                        <li
                          key={component.id}
                          className="enable-disable-drawer__component-item"
                        >
                          <div className="enable-disable-drawer__component-icon" aria-hidden="true">
                            {getStateIcon(component.state)}
                          </div>
                          <span className="enable-disable-drawer__component-name">
                            {component.name}
                          </span>
                          <React.Suspense fallback={
                            <button
                              className="enable-disable-drawer__component-arrow-button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(`Action icon clicked for: ${component.name}`);
                              }}
                              aria-label={`Navigate to ${component.name}`}
                              tabIndex={0}
                            >
                              <Exit size={16} style={{ transform: 'scaleX(-1)' }} />
                            </button>
                          }>
                            <CustomTooltip title="Go To Processors" placement="bottom" followCursor={false} arrow={false} enterDelay={500}>
                              <button
                                className="enable-disable-drawer__component-arrow-button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log(`Action icon clicked for: ${component.name}`);
                                }}
                                aria-label={`Navigate to ${component.name}`}
                                tabIndex={0}
                              >
                                <Exit size={16} style={{ transform: 'scaleX(-1)' }} />
                              </button>
                            </CustomTooltip>
                          </React.Suspense>
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                </>
              ) : (
                <div className="enable-disable-drawer__no-components">
                  No referencing components
                </div>
              )}
              {error && (
                <div className="enable-disable-drawer__error">
                  {error}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="enable-disable-drawer__footer">
          <button 
            onClick={onClose}
            className="enable-disable-drawer__cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="enable-disable-drawer__confirm-button"
            aria-label={buttonText}
            disabled={isSubmitting || !service}
          >
            {buttonText}
          </button>
        </div>
      </div>
      </ReusablePanel>
    </React.Suspense>
  );
};

export default EnableDisableControllerServiceDrawer;

