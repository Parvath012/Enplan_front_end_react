import React from 'react';

const ListItem = ({ children, ...props }: any) => {
  return (
    <div data-testid="list-item" {...props}>
      {children}
    </div>
  );
};

export default ListItem;

