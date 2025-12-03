import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowserDetailsPanel from '../../../src/components/common/BrowserDetailsPanel';

describe('BrowserDetailsPanel', () => {
  const defaultProps = {
    selectedItem: null,
    createError: null,
    className: 'test-panel',
    unknownItemName: 'Unknown Item',
    noDescriptionText: 'No description available.'
  };

  it('should render nothing when no item is selected and no error', () => {
    const { container } = render(<BrowserDetailsPanel {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByText('Unknown Item')).not.toBeInTheDocument();
  });

  it('should render selected item with type', () => {
    const selectedItem = {
      type: 'Test Type',
      description: 'Test Description'
    };
    
    render(<BrowserDetailsPanel {...defaultProps} selectedItem={selectedItem} />);
    
    expect(screen.getByText('Test Type')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render unknown item name when type is missing', () => {
    const selectedItem = {
      description: 'Test Description'
    };
    
    render(<BrowserDetailsPanel {...defaultProps} selectedItem={selectedItem} />);
    
    expect(screen.getByText('Unknown Item')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render no description text when description is missing', () => {
    const selectedItem = {
      type: 'Test Type'
    };
    
    render(<BrowserDetailsPanel {...defaultProps} selectedItem={selectedItem} />);
    
    expect(screen.getByText('Test Type')).toBeInTheDocument();
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  it('should render no description text when description is empty string', () => {
    const selectedItem = {
      type: 'Test Type',
      description: ''
    };
    
    render(<BrowserDetailsPanel {...defaultProps} selectedItem={selectedItem} />);
    
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  it('should render no description text when description is only whitespace', () => {
    const selectedItem = {
      type: 'Test Type',
      description: '   '
    };
    
    render(<BrowserDetailsPanel {...defaultProps} selectedItem={selectedItem} />);
    
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  it('should trim description text', () => {
    const selectedItem = {
      type: 'Test Type',
      description: '  Test Description  '
    };
    
    render(<BrowserDetailsPanel {...defaultProps} selectedItem={selectedItem} />);
    
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render create error when present', () => {
    const createError = 'Failed to create item';
    
    render(<BrowserDetailsPanel {...defaultProps} createError={createError} />);
    
    expect(screen.getByText('Failed to create item')).toBeInTheDocument();
  });

  it('should render both selected item and error', () => {
    const selectedItem = {
      type: 'Test Type',
      description: 'Test Description'
    };
    const createError = 'Error occurred';
    
    render(
      <BrowserDetailsPanel 
        {...defaultProps} 
        selectedItem={selectedItem} 
        createError={createError} 
      />
    );
    
    expect(screen.getByText('Test Type')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('should apply correct className', () => {
    const { container } = render(<BrowserDetailsPanel {...defaultProps} />);
    const panel = container.firstChild as HTMLElement;
    
    expect(panel).toHaveClass('test-panel');
  });

  it('should have correct inline styles', () => {
    const { container } = render(<BrowserDetailsPanel {...defaultProps} />);
    const panel = container.firstChild as HTMLElement;
    
    expect(panel).toHaveStyle({
      top: '482px',
      height: 'calc(100vh - 482px - 46px)',
      minHeight: '80px'
    });
  });

  it('should handle non-string description gracefully', () => {
    const selectedItem = {
      type: 'Test Type',
      description: 123 as any
    };
    
    render(<BrowserDetailsPanel {...defaultProps} selectedItem={selectedItem} />);
    
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });
});

