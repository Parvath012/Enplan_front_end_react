import React from 'react';

const CountryActionCellRenderer = ({ data, onToggle, isEditMode = true }: any) => {
  const handleClick = () => {
    if (onToggle && data) {
      onToggle(data);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      data-testid="country-action-button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={!isEditMode}
      title="Toggle country"
      aria-label="Toggle country"
    >
      {data || 'Toggle'}
    </button>
  );
};

export default CountryActionCellRenderer;





