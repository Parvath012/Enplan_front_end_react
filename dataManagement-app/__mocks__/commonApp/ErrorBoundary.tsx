import React from 'react';

const MockErrorBoundary: React.FC<any> = ({ children, fallback }) => {
  return children || fallback;
};

export default MockErrorBoundary;

