import React from 'react';

interface CustomCheckboxProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
  [key: string]: any;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  disabled,
  className,
  'data-testid': testId,
  ...props
}) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={className}
      data-testid={testId ?? 'custom-checkbox-mock'}
      {...props}
    />
  );
};

export default CustomCheckbox;

