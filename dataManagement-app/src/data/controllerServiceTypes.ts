// Controller Service Types data based on NiFi 2.3.0
export interface ControllerServiceType {
  id: string;
  type: string;
  fullType?: string; // Full class name for API calls (e.g., "org.apache.nifi.services.azure.storage.ADLSCredentialsControllerService")
  version: string;
  tags: string[];
  description?: string;
  restricted?: boolean; // Indicates if the controller service is restricted
  bundle?: {
    group: string;
    artifact: string;
    version: string;
  };
}

