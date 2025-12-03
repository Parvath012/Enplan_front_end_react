import React from 'react';

const SearchField = ({ value, onChange, placeholder }: any) => {
  return (
    <div data-testid="search-field">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid="search-input"
      />
    </div>
  );
};

export default SearchField;
