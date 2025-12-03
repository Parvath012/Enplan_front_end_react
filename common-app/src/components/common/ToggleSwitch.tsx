import React from 'react';
import './ToggleSwitch.css';

type ToggleSwitchProps = {
  isOn: boolean;
  handleToggle: () => void;
  disabled?: boolean;
  showPointerOnDisabled?: boolean; // When true, shows pointer cursor even when disabled
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, handleToggle, disabled = false, showPointerOnDisabled = false }) => {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!handleToggle || disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const handleClick = () => {
    console.log('ToggleSwitch handleClick called, disabled:', disabled, 'handleToggle exists:', !!handleToggle);
    if (handleToggle && !disabled) {
      handleToggle();
    }
  };

  return (
    <div
      className={`toggle-switch ${disabled ? 'disabled' : ''} ${showPointerOnDisabled ? 'show-pointer-on-disabled' : ''}`}
      role="switch"
      aria-checked={isOn}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      onTouchEnd={handleClick}
    >
      <div className={`switch ${isOn ? 'on' : 'off'} ${disabled ? 'disabled' : ''}`}>
        <div className="circle" />
      </div>
    </div>
  );
};

export default ToggleSwitch;
