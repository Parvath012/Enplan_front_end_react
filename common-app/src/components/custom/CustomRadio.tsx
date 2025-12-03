import React from 'react';
import { Radio, RadioProps } from '@mui/material';
import './CustomRadio.scss';

export interface CustomRadioProps extends Omit<RadioProps, 'classes'> {
  className?: string;
}

const CustomRadio: React.FC<CustomRadioProps> = ({ className = '', ...props }) => {
  return (
    <Radio
      {...props}
      className={`custom-radio ${className}`}
      classes={{
        root: 'custom-radio__root',
        checked: 'custom-radio__checked',
        disabled: 'custom-radio__disabled',
      }}
    />
  );
};

export default CustomRadio;
