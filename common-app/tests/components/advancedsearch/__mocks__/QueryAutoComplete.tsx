import React from 'react';

const QueryAutoComplete = (props: any) => {
  const [value, setValue] = React.useState(props.value || '');
  const [focused, setFocused] = React.useState(false);
  
  const handleChange = (e: any) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  };
  
  const handleFocus = (e: any) => {
    setFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };
  
  const handleBlur = (e: any) => {
    setFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };
  
  return (
    <div data-testid="query-autocomplete">
      <input 
        data-testid="whisper" 
        role="textbox"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={focused}
      />
      {props.clear !== false && <button data-testid="clear-button" />}
    </div>
  );
};

export default QueryAutoComplete;
