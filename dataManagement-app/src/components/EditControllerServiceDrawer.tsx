import React, { useState, useEffect } from 'react';
import { Typography, IconButton, Tabs, Tab, Box } from '@mui/material';
import { Close as CloseIcon, Copy, InformationFilled, CheckmarkFilled } from '@carbon/icons-react';
import { nifiApiService } from '../api/nifi/nifiApiService';
import { generateUUID } from '../utils/uuidUtils';
import './EditControllerServiceDrawer.scss';

// Import CustomTooltip from common-app with fallback
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip').catch(err => {
  console.error('Failed to load CustomTooltip from common-app:', err);
  return { 
    default: ({ children, title }: any) => <div title={title}>{children}</div>
  };
}));

// Import TextField and SelectField from common-app
const TextField = React.lazy(() => import('commonApp/TextField').catch(err => {
  console.error('Failed to load TextField from common-app:', err);
  return { default: () => <div>TextField failed to load</div> };
}));

const SelectField = React.lazy(() => import('commonApp/SelectField').catch(err => {
  console.error('Failed to load SelectField from common-app:', err);
  return { default: () => <div>SelectField failed to load</div> };
}));

// Import ReusablePanel
const ReusablePanel = React.lazy(() => import('./common/ReusablePanel').catch(err => {
  console.error('Failed to load ReusablePanel:', err);
  return { 
    default: () => <div>ReusablePanel failed to load</div>
  };
}));

interface EditControllerServiceDrawerProps {
  open: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    state: string;
  } | null;
  onConfirm: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`edit-controller-service-tabpanel-${index}`}
      aria-labelledby={`edit-controller-service-tab-${index}`}
      className="edit-controller-service-drawer__tab-panel"
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
};

const EditControllerServiceDrawer: React.FC<EditControllerServiceDrawerProps> = ({
  open,
  onClose,
  service,
  onConfirm
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [serviceDetails, setServiceDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [bulletinLevel, setBulletinLevel] = useState('WARN');
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [comments, setComments] = useState('');
  const [propertiesChanged, setPropertiesChanged] = useState(false); // Track if properties were modified (not used anymore since properties are read-only)
  
  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setTabValue(0);
      setError(null);
      setServiceDetails(null);
      setBulletinLevel('WARN');
      setProperties({});
      setComments('');
      setPropertiesChanged(false);
      // Reset verification state
      setIsVerifying(false);
      setVerificationResult(null);
      setVerificationError(null);
    }
  }, [open]);

  // Fetch service details when drawer opens
  useEffect(() => {
    if (open && service?.id) {
      fetchServiceDetails();
    }
  }, [open, service?.id]);

  const fetchServiceDetails = async () => {
    if (!service?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const details = await nifiApiService.getControllerService(service.id);
      setServiceDetails(details);
      
      // Set form values from details
      if (details.component) {
        setBulletinLevel(details.component.bulletinLevel || 'WARN');
        setComments(details.component.comments || '');
        
        // Extract properties - NiFi API returns properties as { key: { value: string } }
        const props: Record<string, string> = {};
        if (details.component.properties) {
          Object.keys(details.component.properties).forEach(key => {
            const propValue = details.component.properties[key];
            // Handle both formats: { value: string } or just string
            props[key] = typeof propValue === 'object' && propValue !== null 
              ? (propValue.value || '') 
              : (propValue || '');
          });
        }
        setProperties(props);
      }
    } catch (err: any) {
      console.error('Failed to fetch controller service details:', err);
      setError(err.message || 'Failed to fetch controller service details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyId = () => {
    if (service?.id) {
      navigator.clipboard.writeText(service.id);
    }
  };

  // Helper to detect if error is a 409 conflict
  const isConflictError = (err: any): boolean => {
    const errorDetails = String(err?.response?.data?.details ?? '');
    const errorMessage = String(err?.message ?? '');
    const errorError = String(err?.response?.data?.error ?? '');
    const responseStatus = err?.response?.status;
    
    return responseStatus === 409 || 
           (responseStatus === 500 && 
            (errorDetails.includes('409') || 
             errorMessage.includes('409') ||
             errorError.includes('409')));
  };

  // Helper to refresh revision and update payload
  const refreshRevisionAndUpdatePayload = async (updateData: any, attempt: number, serviceId: string): Promise<void> => {
    const preFetchDelay = 100 * attempt;
    await new Promise(resolve => setTimeout(resolve, preFetchDelay));
    
    const refreshedDetails = await nifiApiService.getControllerService(serviceId);
    const latestVersion = refreshedDetails.revision?.version ?? 0;
    const newClientId = generateUUID();
    
    const newRevision = {
      version: typeof latestVersion === 'number' && !isNaN(latestVersion) ? latestVersion : 0,
      clientId: newClientId
    };
    
    updateData.revision = newRevision;
    
    const retryDelay = 500 * attempt;
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  };

  // Helper to retry update with conflict handling
  const retryUpdateWithConflictHandling = async (updateData: any, maxRetries: number, serviceId: string): Promise<void> => {
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        attempt++;
        await nifiApiService.updateControllerService(serviceId, updateData);
        return; // Success
      } catch (err: any) {
        const isConflict = isConflictError(err);
        
        if (isConflict && attempt <= maxRetries) {
          await refreshRevisionAndUpdatePayload(updateData, attempt, serviceId);
          continue;
        }
        
        throw err;
      }
    }
  };

  const handleApply = async () => {
    if (!service || !serviceDetails) return;
    
    setIsSubmitting(true);
    setError(null);
    
    let updateData: any = null;
    
    try {
      const latestServiceDetails = await nifiApiService.getControllerService(service.id);
      const latestVersion = latestServiceDetails.revision?.version ?? 0;
      const revision = {
        version: typeof latestVersion === 'number' && !isNaN(latestVersion) ? latestVersion : 0,
        clientId: generateUUID()
      };

      const componentName = latestServiceDetails.component?.name ?? service.name ?? '';
      if (!componentName) {
        throw new Error('Service name is required but not available');
      }
      
      const component: any = {
        id: service.id,
        name: componentName,
        bulletinLevel: bulletinLevel ?? 'NONE',
        comments: comments ?? ''
      };

      if (propertiesChanged && latestServiceDetails.component?.descriptors) {
        const formattedProperties: Record<string, { value: string }> = {};
        
        Object.keys(latestServiceDetails.component.descriptors).forEach(key => {
          const descriptor = latestServiceDetails.component.descriptors[key];
          if (descriptor.sensitive || key.startsWith('nifi.')) {
            return;
          }
          
          const currentPropValue = latestServiceDetails.component.properties?.[key];
          const currentValue = typeof currentPropValue === 'object' && currentPropValue !== null 
            ? (currentPropValue.value ?? '') 
            : (currentPropValue ?? '');
          
          const updatedValue = properties[key] ?? currentValue;
          formattedProperties[key] = { value: updatedValue ?? '' };
        });
        
        if (Object.keys(formattedProperties).length > 0) {
          component.properties = formattedProperties;
        }
      }

      updateData = {
        revision,
        disconnectedNodeAcknowledged: false,
        component
      };

      await retryUpdateWithConflictHandling(updateData, 3, service.id);

      onConfirm();
      onClose();
    } catch (err: any) {
      console.error('Failed to update controller service:', err);
      const errorMessage = err?.response?.data?.message ?? 
                          err?.response?.data?.error ?? 
                          err?.message ?? 
                          'Failed to update controller service';
      
      if (comments && comments.trim() !== '') {
        console.error('Error updating comments (not shown to user):', errorMessage);
        onConfirm();
        onClose();
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceVersion = () => {
    if (serviceDetails?.component?.bundle) {
      return serviceDetails.component.bundle.version ?? '';
    }
    return '';
  };

  const getServiceType = () => {
    if (serviceDetails?.component) {
      const type = serviceDetails.component.type ?? '';
      const version = getServiceVersion();
      return version ? `${type} ${version}` : type;
    }
    return '';
  };

  const getSupportedServices = () => {
    // This would come from the API response - for now return empty array
    if (serviceDetails?.component?.supportsControllerService) {
      return Array.isArray(serviceDetails.component.supportsControllerService)
        ? serviceDetails.component.supportsControllerService
        : [serviceDetails.component.supportsControllerService];
    }
    return [];
  };

  const bulletinLevelOptions = ['WARN', 'INFO', 'DEBUG', 'ERROR', 'NONE'];

  // Check if there are any properties in the required field table
  const hasRequiredFieldData = React.useMemo(() => {
    if (!serviceDetails?.component?.descriptors) {
      return false;
    }
    
    const validDescriptors = Object.keys(serviceDetails.component.descriptors).filter(key => {
      const descriptor = serviceDetails.component.descriptors[key];
      // Only count properties that are not sensitive and not required by framework
      return !descriptor.sensitive && !key.startsWith('nifi.');
    });
    
    return validDescriptors.length > 0;
  }, [serviceDetails]);

  // Helper function to extract verification request ID from response
  const extractVerificationRequestId = (verificationResponse: any): string | null => {
    // First, check if response itself is the request object (direct response)
    if (verificationResponse?.id && !verificationResponse?.request) {
      return verificationResponse.id;
    }
    
    // Try nested structures
    const id = verificationResponse?.request?.id ?? 
               verificationResponse?.request?.requestId ??
               verificationResponse?.verificationRequest?.id ??
               verificationResponse?.verificationRequest?.requestId ??
               verificationResponse?.verificationRequestId ??
               verificationResponse?.id ??
               verificationResponse?.requestId;
    
    if (id) {
      return id;
    }
    
    // If still no ID, check if response is nested differently or is an array
    if (Array.isArray(verificationResponse)) {
      const firstItem = verificationResponse[0];
      return firstItem?.id ?? firstItem?.requestId ?? firstItem?.request?.id ?? null;
    }
    
    if (verificationResponse?.request) {
      const request = verificationResponse.request;
      return request.id ?? request.requestId ?? request.verificationRequestId ?? null;
    }
    
    return null;
  };

  // Helper function to check if verification is complete
  const isVerificationComplete = (verificationData: any): boolean => {
    const request = verificationData?.request ?? verificationData;
    return request?.complete === true || 
           request?.status === 'COMPLETE' || 
           request?.complete === 'true';
  };

  // Helper function to handle 404 error during polling
  const handle404PollError = async (
    serviceId: string,
    verificationRequestId: string,
    lastSuccessfulResponse: any
  ): Promise<any> => {
    if (lastSuccessfulResponse) {
      return lastSuccessfulResponse;
    }
    
    // Try one more time after a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      return await nifiApiService.getControllerServiceVerificationRequest(
        serviceId,
        verificationRequestId
      );
    } catch {
      throw new Error('Verification request was deleted before results could be retrieved');
    }
  };

  // Helper function to poll for verification results
  const pollVerificationResults = async (
    serviceId: string,
    verificationRequestId: string
  ): Promise<any> => {
    const maxAttempts = 30; // Poll for up to 30 seconds
    let attempts = 0;
    let verificationData: any = null;
    let lastSuccessfulResponse: any = null;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls
      
      try {
        verificationData = await nifiApiService.getControllerServiceVerificationRequest(
          serviceId,
          verificationRequestId
        );
        
        lastSuccessfulResponse = verificationData;
        
        if (isVerificationComplete(verificationData)) {
          return verificationData;
        }
        
        attempts++;
      } catch (pollError: any) {
        if (pollError?.response?.status === 404) {
          return await handle404PollError(serviceId, verificationRequestId, lastSuccessfulResponse);
        }
        
        attempts++;
        
        // Log but continue polling for non-404 errors
        if (pollError?.response?.status !== 404) {
          console.warn('Error polling verification request:', pollError);
        }
      }
    }
    
    if (attempts >= maxAttempts && !verificationData && !lastSuccessfulResponse) {
      throw new Error('Verification request timed out');
    }
    
    return lastSuccessfulResponse ?? verificationData;
  };

  // Handle verification
  const handleVerify = async () => {
    if (!service?.id || isVerifying) return;
    
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);
    
    let verificationRequestId: string | null = null;
    
    try {
      // Step 1: Analyze configuration
      await nifiApiService.analyzeControllerServiceConfig(service.id, {});
      
      // Step 2: Create verification request
      const verificationResponse = await nifiApiService.createControllerServiceVerificationRequest(
        service.id,
        {},
        {}
      );
      
      // Log the response to debug structure
      console.log('Verification response:', verificationResponse);
      console.log('Verification response type:', typeof verificationResponse);
      console.log('Verification response keys:', verificationResponse ? Object.keys(verificationResponse) : 'null');
      
      // Extract request ID from response
      verificationRequestId = extractVerificationRequestId(verificationResponse);
      
      if (!verificationRequestId) {
        console.error('Full verification response structure:', JSON.stringify(verificationResponse, null, 2));
        throw new Error(`Failed to get verification request ID. Response: ${JSON.stringify(verificationResponse)}`);
      }
      
      console.log('Extracted verification request ID:', verificationRequestId);
      
      // Step 3: Poll for verification results
      const verificationData = await pollVerificationResults(service.id, verificationRequestId);
      setVerificationResult(verificationData);
      
    } catch (err: any) {
      console.error('Failed to verify controller service:', err);
      setVerificationError(err?.message ?? 'Failed to verify controller service');
    } finally {
      setIsVerifying(false);
      
      // Step 4: Clean up - delete verification request if it exists
      if (verificationRequestId && service?.id) {
        try {
          await nifiApiService.deleteControllerServiceVerificationRequest(
            service.id,
            verificationRequestId
          );
        } catch (cleanupError) {
          // Ignore cleanup errors
          console.warn('Failed to cleanup verification request:', cleanupError);
        }
      }
    }
  };

  // Format verification results for display
  const formatVerificationResults = (): string => {
    if (!verificationResult) return '';
    
    const request = verificationResult?.request || verificationResult;
    const results = request?.results || [];
    
    if (!results || results.length === 0) {
      return 'Verification completed with no issues.';
    }
    
    let formatted = '';
    results.forEach((result: any, index: number) => {
      if (index > 0) formatted += '\n\n';
      formatted += `Result ${index + 1}:\n`;
      if (result.outcome) formatted += `Outcome: ${result.outcome}\n`;
      if (result.explanation) formatted += `Explanation: ${result.explanation}\n`;
      if (result.verificationStepName) formatted += `Step: ${result.verificationStepName}\n`;
      if (result.reason) formatted += `Reason: ${result.reason}\n`;
    });
    
    return formatted || 'Verification completed.';
  };

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
        customClassName="edit-controller-service-drawer-panel"
      >
        <div className="edit-controller-service-drawer">
        {/* Header */}
        <div className="edit-controller-service-drawer__header">
          <Typography 
            variant="h6" 
            className="edit-controller-service-drawer__title"
          >
            Edit Controller Service
          </Typography>
          <React.Suspense fallback={
            <IconButton 
              onClick={onClose}
              className="edit-controller-service-drawer__close-button"
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
                className="edit-controller-service-drawer__close-button"
                aria-label="Close"
                disableRipple
              >
                <CloseIcon size={22} />
              </IconButton>
            </CustomTooltip>
          </React.Suspense>
        </div>

        {/* Tabs */}
        <div className="edit-controller-service-drawer__tabs-container">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            className="edit-controller-service-drawer__tabs"
            aria-label="Edit controller service tabs"
            variant="standard"
            sx={{
              '& .MuiTabs-indicator': {
                display: 'none', // Hide default indicator
              },
            }}
          >
            <Tab label="Settings" disableRipple />
            <Tab label="Properties" disableRipple />
            <Tab label="Comments" disableRipple />
          </Tabs>
        </div>

        {/* Content */}
        <div className="edit-controller-service-drawer__content">
          {(() => {
            if (isLoading) {
              return <div className="edit-controller-service-drawer__loading"></div>;
            }
            
            if (error) {
              return <div className="edit-controller-service-drawer__error">{error}</div>;
            }
            
            return (
              <>
                {/* Settings Tab */}
              <TabPanel value={tabValue} index={0}>
                <div className="edit-controller-service-drawer__settings">
                  <div className="edit-controller-service-drawer__field">
                    <label htmlFor="service-id-input" className="edit-controller-service-drawer__label">Id</label>
                    <div className="edit-controller-service-drawer__id-field">
                      <input
                        id="service-id-input"
                        type="text"
                        value={service?.id ?? ''}
                        readOnly
                        className="edit-controller-service-drawer__input"
                      />
                      <button
                        className="edit-controller-service-drawer__copy-button"
                        onClick={handleCopyId}
                        aria-label="Copy ID"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="edit-controller-service-drawer__field">
                    <label htmlFor="service-type-input" className="edit-controller-service-drawer__label">Type</label>
                    <input
                      id="service-type-input"
                      type="text"
                      value={getServiceType()}
                      readOnly
                      className="edit-controller-service-drawer__input"
                    />
                  </div>

                  <div className="edit-controller-service-drawer__field">
                    <label htmlFor="service-bundle-input" className="edit-controller-service-drawer__label">Bundle</label>
                    <input
                      id="service-bundle-input"
                      type="text"
                      value={
                        serviceDetails?.component?.bundle
                          ? `${serviceDetails.component.bundle.group} - ${serviceDetails.component.bundle.artifact}`
                          : ''
                      }
                      readOnly
                      className="edit-controller-service-drawer__input"
                    />
                  </div>

                  <div className="edit-controller-service-drawer__field">
                    <label htmlFor="supported-services-list" className="edit-controller-service-drawer__label">Supports Controller Service</label>
                    <div className="edit-controller-service-drawer__supported-services">
                      {getSupportedServices().length > 0 ? (
                        <ul className="edit-controller-service-drawer__supported-list">
                          {getSupportedServices().map((service: any, index: number) => (
                            <li key={`supported-service-${index}-${typeof service === 'string' ? service : service.type ?? ''}`}>
                              {typeof service === 'string' 
                                ? service 
                                : `${service.type ?? ''} ${service.version ?? ''} from ${service.bundle?.group ?? ''} - ${service.bundle?.artifact ?? ''}`
                              }
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="edit-controller-service-drawer__no-supported">
                          No supported controller services
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="edit-controller-service-drawer__field">
                    <div className="edit-controller-service-drawer__label-row">
                      <label htmlFor="bulletin-level-select" className="edit-controller-service-drawer__label">Bulletin Level</label>
                      <React.Suspense fallback={
                        <button className="edit-controller-service-drawer__info-icon-button" aria-label="Bulletin level information">
                          <InformationFilled size={14} />
                        </button>
                      }>
                        <CustomTooltip title="Bulletin level for this controller service" placement="bottom" followCursor={false} arrow={false} enterDelay={500}>
                          <button className="edit-controller-service-drawer__info-icon-button" aria-label="Bulletin level information">
                            <InformationFilled size={14} />
                          </button>
                        </CustomTooltip>
                      </React.Suspense>
                    </div>
                    <React.Suspense fallback={<select id="bulletin-level-select"><option>{bulletinLevel}</option></select>}>
                      <SelectField
                        label=""
                        value={bulletinLevel}
                        onChange={(value: string) => setBulletinLevel(value)}
                        options={bulletinLevelOptions}
                        fullWidth
                        placeholder="Select Bulletin Level"
                      />
                    </React.Suspense>
                  </div>
                </div>
              </TabPanel>

              {/* Properties Tab */}
              <TabPanel value={tabValue} index={1}>
                <div className="edit-controller-service-drawer__properties">
                  <div className="edit-controller-service-drawer__properties-content">
                    <div className="edit-controller-service-drawer__properties-main">
                      <div className="edit-controller-service-drawer__properties-title-row">
                        <div className="edit-controller-service-drawer__properties-title">Required field</div>
                      </div>
                      {serviceDetails?.component?.descriptors && Object.keys(serviceDetails.component.descriptors).length > 0 ? (
                        <div className="edit-controller-service-drawer__properties-table">
                          <table className="edit-controller-service-drawer__properties-table-inner">
                            <thead>
                              <tr>
                                <th className="edit-controller-service-drawer__property-header">Property</th>
                                <th className="edit-controller-service-drawer__value-header">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(serviceDetails.component.descriptors).map((key) => {
                                const descriptor = serviceDetails.component.descriptors[key];
                                // Only show properties that are not sensitive and not required by framework
                                if (descriptor.sensitive || key.startsWith('nifi.')) {
                                  return null;
                                }
                                
                                const currentPropValue = serviceDetails.component.properties?.[key];
                                const currentValue = typeof currentPropValue === 'object' && currentPropValue !== null 
                                  ? (currentPropValue.value ?? '') 
                                  : (currentPropValue ?? '');
                                
                                const displayValue = properties[key] ?? currentValue;
                                const hasValue = displayValue && displayValue.trim() !== '';
                                
                                return (
                                  <tr key={key} className="edit-controller-service-drawer__property-row">
                                    <td className="edit-controller-service-drawer__property-name">
                                      {descriptor.displayName ?? key}
                                    </td>
                                    <td className="edit-controller-service-drawer__property-value-cell">
                                      <div className="edit-controller-service-drawer__property-value-wrapper">
                                        <React.Suspense fallback={
                                          <button className="edit-controller-service-drawer__info-icon-button" aria-label="Property information">
                                            <InformationFilled size={14} />
                                          </button>
                                        }>
                                          <CustomTooltip title={descriptor.description ?? ''} placement="bottom" followCursor={false} arrow={false} enterDelay={500}>
                                            <button className="edit-controller-service-drawer__info-icon-button" aria-label="Property information">
                                              <InformationFilled size={14} />
                                            </button>
                                          </CustomTooltip>
                                        </React.Suspense>
                                        <span className={`edit-controller-service-drawer__property-value-display ${!hasValue ? 'edit-controller-service-drawer__property-value-empty' : ''}`}>
                                          {hasValue ? displayValue : 'No value set'}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }).filter(Boolean)}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="edit-controller-service-drawer__no-properties">
                          No properties available
                        </div>
                      )}
                    </div>
                    <div className="edit-controller-service-drawer__properties-verification">
                      <div className="edit-controller-service-drawer__verification-header">
                        <span className="edit-controller-service-drawer__verification-title">Verification</span>
                        <button
                          className="edit-controller-service-drawer__verification-button"
                          onClick={handleVerify}
                          disabled={isVerifying || !hasRequiredFieldData}
                          aria-label="Verify component"
                          type="button"
                        >
                          <CheckmarkFilled size={16} className="edit-controller-service-drawer__verification-check-icon" />
                        </button>
                      </div>
                      <div className="edit-controller-service-drawer__verification-box">
                        {(() => {
                          if (isVerifying) {
                            return (
                              <div className="edit-controller-service-drawer__verification-text">
                                Verifying component...
                              </div>
                            );
                          }
                          if (verificationError) {
                            return (
                              <div className="edit-controller-service-drawer__verification-error">
                                {verificationError}
                              </div>
                            );
                          }
                          if (verificationResult) {
                            return (
                              <div className="edit-controller-service-drawer__verification-results">
                                <pre style={{ 
                                  margin: 0, 
                                  padding: 0, 
                                  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                  fontSize: '12px',
                                  whiteSpace: 'pre-wrap',
                                  wordWrap: 'break-word'
                                }}>
                                  {formatVerificationResults()}
                                </pre>
                              </div>
                            );
                          }
                          return (
                            <div className="edit-controller-service-drawer__verification-text">
                              Click the checkmark icon to verify this component.
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Comments Tab */}
              <TabPanel value={tabValue} index={2}>
                <div className="edit-controller-service-drawer__comments">
                    <React.Suspense fallback={
                    <textarea
                      id="comments-textarea"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="edit-controller-service-drawer__comments-textarea"
                      placeholder="Add comments..."
                      aria-label="Comments"
                    />
                  }>
                    <TextField
                      id="comments-textarea"
                      label="Comments"
                      value={comments}
                      onChange={(e: any) => setComments(e.target.value)}
                      placeholder="Add comments..."
                      multiline
                      rows={10}
                      fullWidth
                    />
                  </React.Suspense>
                </div>
              </TabPanel>
              </>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="edit-controller-service-drawer__footer">
          <button 
            onClick={onClose}
            className="edit-controller-service-drawer__cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="edit-controller-service-drawer__apply-button"
            aria-label="Apply"
            disabled={isSubmitting || !service || isLoading}
          >
            Apply
          </button>
        </div>
      </div>
      </ReusablePanel>
    </React.Suspense>
  );
};

export default EditControllerServiceDrawer;

