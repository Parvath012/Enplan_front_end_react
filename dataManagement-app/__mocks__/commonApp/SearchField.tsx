import React from 'react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
}) => {
  return (
    <input
      data-testid="search-field"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      aria-label={placeholder || 'Search'}
    />
  );
};

export default SearchField;

