import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowserErrorDisplay from '../../../src/components/common/BrowserErrorDisplay';

describe('BrowserErrorDisplay', () => {
  it('should render error message and entity name', () => {
    render(
      <BrowserErrorDisplay 
        errorMessage="Network error occurred" 
        entityName="Processors" 
      />
    );
    
    expect(screen.getByText('Error loading Processors')).toBeInTheDocument();
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('should render with different entity names', () => {
    render(
      <BrowserErrorDisplay 
        errorMessage="Failed to fetch" 
        entityName="controller services" 
      />
    );
    
    expect(screen.getByText('Error loading controller services')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('should have correct inline styles', () => {
    const { container } = render(
      <BrowserErrorDisplay 
        errorMessage="Test error" 
        entityName="Test" 
      />
    );
    
    const errorDiv = container.firstChild as HTMLElement;
    expect(errorDiv).toHaveStyle({
      padding: '20px',
      textAlign: 'center',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      flexDirection: 'column',
      gap: '10px'
    });
  });

  it('should render error message with correct styling', () => {
    const { container } = render(
      <BrowserErrorDisplay 
        errorMessage="Detailed error message" 
        entityName="Items" 
      />
    );
    
    const errorMessage = screen.getByText('Detailed error message');
    expect(errorMessage).toHaveStyle({
      fontSize: '12px',
      color: 'rgb(102, 102, 102)' // #666666
    });
  });

  it('should render entity name with correct styling', () => {
    const { container } = render(
      <BrowserErrorDisplay 
        errorMessage="Error" 
        entityName="Components" 
      />
    );
    
    const entityName = screen.getByText('Error loading Components');
    expect(entityName).toHaveStyle({
      fontSize: '14px',
      color: 'rgb(211, 47, 47)' // #d32f2f
    });
  });
});

