import React from 'react';

interface BrowserErrorDisplayProps {
  errorMessage: string;
  entityName: string; // e.g., "Processors" or "controller services"
}

const BrowserErrorDisplay: React.FC<BrowserErrorDisplayProps> = ({ errorMessage, entityName }) => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ fontSize: '14px', color: '#d32f2f' }}>Error loading {entityName}</div>
      <div style={{ fontSize: '12px', color: '#666666' }}>{errorMessage}</div>
    </div>
  );
};

export default BrowserErrorDisplay;

