// Processor Types data based on NiFi API
export interface ProcessorType {
  id: string;
  type: string;
  fullType?: string; // Full class name for API calls
  version: string;
  tags: string[];
  description?: string;
  restricted?: boolean; // Indicates if the processor is restricted
  bundle?: {
    group: string;
    artifact: string;
    version: string;
  };
}


