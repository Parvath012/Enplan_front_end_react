import React from 'react';

const NotificationAlert = ({ 
  open, 
  message, 
  title,
  severity = 'info', 
  variant = 'info',
  onClose, 
  actions,
  autoHideDuration = 6000 
}: any) => {
  if (!open) return null;
  
  return (
    <div 
      data-testid="notification-alert" 
      data-severity={severity || variant}
      data-message={message}
      data-auto-hide-duration={autoHideDuration}
    >
      {title && <h3>{title}</h3>}
      {message && <p>{message}</p>}
      {actions?.map((action: any, index: number) => (
        <button key={index} onClick={action.onClick} data-emphasis={action.emphasis}>
          {action.label}
        </button>
      ))}
      {onClose && <button onClick={onClose} data-testid="notification-close">Close</button>}
    </div>
  );
};

export default NotificationAlert;
