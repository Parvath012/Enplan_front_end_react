const NotificationAlert = (props) => {
  if (!props.open) return null;
  return (
    <div data-testid="notification-alert">
      <div data-testid="alert-title">{props.title}</div>
      <div data-testid="alert-message">{props.message}</div>
      <button data-testid="alert-close" onClick={props.onClose}>Close</button>
      {props.actions?.map((action, index) => (
        <button 
          key={index}
          data-testid={`alert-action-${index}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

module.exports = NotificationAlert;