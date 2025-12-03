const React = require('react');

const MultiSelectField = ({ label, value, onChange, options, placeholder, error, errorMessage, required }) => {
  return React.createElement('div', { 'data-testid': 'multi-select-field' },
    React.createElement('label', null, label, required && ' *'),
    React.createElement('select', {
      'data-testid': `multi-select-input-${label.toLowerCase().replace(/\s+/g, '-')}`,
      value: value || '',
      onChange: (e) => onChange(e.target.value),
      multiple: true,
      'aria-invalid': !!error
    },
      React.createElement('option', { value: '' }, placeholder),
      options?.map((option) =>
        React.createElement('option', { key: option.value, value: option.value }, option.label)
      )
    ),
    error && React.createElement('span', { 'data-testid': 'error-message' }, errorMessage)
  );
};

module.exports = MultiSelectField;



