import React from 'react';

// This is a simplified mock for CustomRadio that just renders a component with testId
// In real implementation, it would work with MaterialUI's RadioGroup and FormControlLabel
const CustomRadio = (props: any) => {
  return (
    <div data-testid="custom-radio">
      <div data-testid="radio-option-default">
        <input
          type="radio"
          name={props.name || 'radio-group'}
          value={props.value || ''}
          checked={props.checked}
          onChange={props.onChange}
          readOnly={!props.onChange}
        />
        <label>{props.label || ''}</label>
      </div>
    </div>
  );
};

export default CustomRadio;
