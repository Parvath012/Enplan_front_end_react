import React from 'react';

const MockToggleSwitch = ({ isOn, handleToggle }: any) => {
  return (
    <button 
      data-testid="toggle-switch" 
      data-is-on={isOn}
      onClick={handleToggle}
    >
      Toggle
    </button>
  );
};

export default MockToggleSwitch;



