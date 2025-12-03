import React from 'react';

const Panel: React.FC<any> = ({ children, ...props }) => {
  return <div data-testid="panel" {...props}>{children}</div>;
};

export default Panel;

