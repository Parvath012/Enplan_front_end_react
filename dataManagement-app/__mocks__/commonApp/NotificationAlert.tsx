import React from 'react';

interface NotificationAlertAction {
  label: string;
  onClick: () => void;
  emphasis?: 'primary' | 'secondary';
}

interface NotificationAlertProps {
  open: boolean;
  variant?: 'warning' | 'error' | 'info' | 'success';
  title?: string;
  message?: string;
  onClose?: () => void;
  actions?: NotificationAlertAction[];
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({
  open,
  variant,
  title,
  message,
  onClose,
  actions,
}) => {
  if (!open) return null;

  return (
    <div data-testid="notification-alert" data-variant={variant}>
      {title && <div data-testid="notification-title">{title}</div>}
      {message && <div data-testid="notification-message">{message}</div>}
      {actions && actions.length > 0 && (
        <div data-testid="notification-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              data-testid={`alert-${action.emphasis === 'primary' ? 'accept' : 'cancel'}`}
              data-emphasis={action.emphasis}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      {onClose && (
        <button onClick={onClose} data-testid="notification-close">
          Close
        </button>
      )}
    </div>
  );
};

export default NotificationAlert;

