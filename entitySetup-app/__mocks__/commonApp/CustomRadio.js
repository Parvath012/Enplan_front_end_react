const React = require('react');

const CustomRadio = ({ value, checked, onChange, children, className, ...props }) => {
  return React.createElement('input', {
    type: 'radio',
    value: value || 'default-value',
    checked: checked || false,
    onChange: onChange || (() => {}),
    'data-testid': 'test-lazy-component',
    className: className,
    ...props
  });
};

module.exports = CustomRadio;
