import React from 'react';

const HeaderBar = ({ title, RightAction }: any) => {
  return (
    <div data-testid="header-bar">
      <h2 data-testid="header-title">{title}</h2>
      {RightAction && <div data-testid="right-action"><RightAction /></div>}
    </div>
  );
};

export default HeaderBar;
