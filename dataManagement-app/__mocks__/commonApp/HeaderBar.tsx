import React from 'react';

const MockHeaderBar: React.FC<any> = ({ title, ...props }) => {
  return (
    <div data-testid="header-bar" {...props}>
      {title}
    </div>
  );
};

export default MockHeaderBar;

