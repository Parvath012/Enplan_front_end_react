import React from 'react';

const SearchField = ({ value, onChange, placeholder, ...props }: any) => {
  return (
    <div data-testid="search-field" {...props}>
      <input
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchField;