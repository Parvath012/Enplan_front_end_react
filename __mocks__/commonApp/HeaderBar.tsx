import React from 'react';

const HeaderBar = ({ title, children, ...props }: any) => {
  return (
    <div data-testid="header-bar" {...props}>
      {title && <h1>{title}</h1>}
      {children}
    </div>
  );
};

export default HeaderBar;

