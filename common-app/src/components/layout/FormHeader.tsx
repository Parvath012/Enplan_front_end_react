import React from 'react';
import FormHeaderBase from './FormHeaderBase';
import { FormHeaderProps } from '../../types/FormHeaderTypes';

const FormHeader: React.FC<FormHeaderProps> = (props) => {
  return <FormHeaderBase {...props} />;
};

export default FormHeader;
