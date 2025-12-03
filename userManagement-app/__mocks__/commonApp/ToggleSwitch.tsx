import React from 'react';

const ToggleSwitch = ({ isOn, handleToggle, label, disabled = false }: any) => {
  return (
    <div data-testid="toggle-switch" data-checked={isOn} data-disabled={disabled}>
      <input
        type="checkbox"
        checked={isOn}
        onChange={(e) => {
          if (!disabled) {
            handleToggle(e);
          }
        }}
        disabled={disabled}
        data-testid="toggle-input"
      />
      {label && <span data-testid="toggle-label">{label}</span>}
    </div>
  );
};

export default ToggleSwitch;
