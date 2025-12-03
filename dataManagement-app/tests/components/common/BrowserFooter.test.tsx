import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowserFooter from '../../../src/components/common/BrowserFooter';

describe('BrowserFooter', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onAdd: jest.fn(),
    isAddDisabled: false,
    cancelButtonClassName: 'cancel-btn',
    addButtonClassName: 'add-btn',
    footerClassName: 'footer'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render cancel and add buttons', () => {
    render(<BrowserFooter {...defaultProps} />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<BrowserFooter {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onAdd when add button is clicked', () => {
    render(<BrowserFooter {...defaultProps} />);
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
  });

  it('should disable add button when isAddDisabled is true', () => {
    render(<BrowserFooter {...defaultProps} isAddDisabled={true} />);
    
    const addButton = screen.getByText('Add');
    expect(addButton).toBeDisabled();
  });

  it('should enable add button when isAddDisabled is false', () => {
    render(<BrowserFooter {...defaultProps} isAddDisabled={false} />);
    
    const addButton = screen.getByText('Add');
    expect(addButton).not.toBeDisabled();
  });

  it('should apply correct class names', () => {
    const { container } = render(<BrowserFooter {...defaultProps} />);
    
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass('footer');
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toHaveClass('cancel-btn');
    
    const addButton = screen.getByText('Add');
    expect(addButton).toHaveClass('add-btn');
  });

  it('should not call onAdd when add button is disabled and clicked', () => {
    render(<BrowserFooter {...defaultProps} isAddDisabled={true} />);
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    // Button is disabled, so click should not trigger
    expect(defaultProps.onAdd).not.toHaveBeenCalled();
  });
});

