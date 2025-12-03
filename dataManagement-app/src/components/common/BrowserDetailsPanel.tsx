import React from 'react';

interface BrowserDetailsPanelProps {
  selectedItem: { type?: string; description?: string } | null;
  createError: string | null;
  className: string;
  unknownItemName: string; // e.g., "Unknown Service" or "Unknown Processor"
  noDescriptionText: string; // e.g., "No description available for this controller service."
}

const BrowserDetailsPanel: React.FC<BrowserDetailsPanelProps> = ({
  selectedItem,
  createError,
  className,
  unknownItemName,
  noDescriptionText
}) => {
  return (
    <div 
      className={className}
      style={{
        top: '482px',
        height: 'calc(100vh - 482px - 46px)',
        minHeight: '80px'
      }}
    >
      {selectedItem ? (
        <div className={`${className}-content`}>
          <div className={`${className}-title`}>{selectedItem.type ?? unknownItemName}</div>
          <div className={`${className}-desc`}>
            {selectedItem.description && typeof selectedItem.description === 'string' && selectedItem.description.trim() 
              ? selectedItem.description.trim() 
              : noDescriptionText}
          </div>
        </div>
      ) : null}
      {createError && (
        <div style={{ 
          padding: '12px', 
          margin: '12px',
          backgroundColor: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '4px',
          color: '#c62828',
          fontSize: '12px'
        }}>
          {createError}
        </div>
      )}
    </div>
  );
};

export default BrowserDetailsPanel;

