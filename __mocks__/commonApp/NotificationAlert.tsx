import React from 'react';

const NotificationAlert = ({ message, type, open, onClose, ...props }: any) => {
  if (!open) return null;
  
  return (
    <div data-testid="notification-alert" {...props}>
      <div data-testid="alert-message">{message}</div>
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  );
};

export default NotificationAlert;

