import React from 'react';

const SearchField = (props: any) => (
  <input
    data-testid="search-field"
    value={props.value}
    onChange={e => props.onChange(e.target.value)}
    placeholder={props.placeholder}
    disabled={props.disabled}
    style={props.customStyle}
  />
);

export default SearchField;