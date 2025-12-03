// Mock for commonApp/CustomCheckbox
import React from 'react';

const CustomCheckbox = (props: any) => {
  return <input type="checkbox" data-testid="custom-checkbox-mock" {...props} />;
};

export default CustomCheckbox;

