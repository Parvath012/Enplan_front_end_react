import React from 'react';

const CircularLoader = ({ variant, backgroundColor, ...props }: any) => {
  return (
    <div data-testid="circular-loader" {...props}>
      Loading...
    </div>
  );
};

export default CircularLoader;

