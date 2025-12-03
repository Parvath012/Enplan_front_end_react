import React from 'react';

const ToggleSwitch = ({ checked, onChange, disabled, ...props }: any) => {
  return (
    <div data-testid="toggle-switch" {...props}>
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
    </div>
  );
};

export default ToggleSwitch;

