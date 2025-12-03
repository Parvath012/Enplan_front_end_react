import React from 'react';

interface StatusMessageProps {
  message: string;
  type: 'loading' | 'empty' | 'error';
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message, type }) => {
  return (
    <div data-testid="status-message" data-type={type}>
      {message}
    </div>
  );
};

export default StatusMessage;