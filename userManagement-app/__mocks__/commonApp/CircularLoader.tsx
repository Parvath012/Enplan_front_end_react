import React from 'react';

const CircularLoader = ({ variant = 'indeterminate', backgroundColor = 'transparent' }: any) => {
  return (
    <div data-testid="circular-loader" data-variant={variant} data-background={backgroundColor}>
      Loading...
    </div>
  );
};

export default CircularLoader;
