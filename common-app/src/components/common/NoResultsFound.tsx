import React from 'react';

interface NoResultsFoundProps {
  message?: string;
  height?: string | number;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({ 
  message = "No Results Found",
  height = "200px"
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: '100%',
        backgroundColor: 'transparent'
      }}
    >
      <div
        style={{
          fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#5B6061',
          textAlign: 'center'
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default NoResultsFound;
