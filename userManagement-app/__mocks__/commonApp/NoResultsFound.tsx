import React from 'react';

const NoResultsFound = ({ message = "No Results Found" }: { message?: string }) => {
  return (
    <div data-testid="no-results-found">
      {message}
    </div>
  );
};

export default NoResultsFound;
