import React from 'react';

const StatusMessage = ({ message, type }: any) => {
  return (
    <div className="MuiBox-root" data-testid="status-message">
      <p className="MuiTypography-root" data-testid="status-message-content">
        {message}
      </p>
    </div>
  );
};

export default StatusMessage;





