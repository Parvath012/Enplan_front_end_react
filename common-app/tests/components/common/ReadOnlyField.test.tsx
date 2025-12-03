import React from 'react';
import { render, screen } from '@testing-library/react';
import ReadOnlyField from '../../../src/components/common/ReadOnlyField';

describe('ReadOnlyField', () => {
  it('renders without crashing', () => {
    render(<ReadOnlyField label="Test Label" value="Test Value" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('displays label correctly', () => {
    const testLabel = 'Financial Year Name';
    render(<ReadOnlyField label={testLabel} value="Test Value" />);
    expect(screen.getByText(testLabel)).toBeInTheDocument();
  });

  it('displays value correctly', () => {
    const testValue = 'FY 19-20';
    render(<ReadOnlyField label="Test Label" value={testValue} />);
    expect(screen.getByText(testValue)).toBeInTheDocument();
  });

  it('displays dash when value is empty', () => {
    render(<ReadOnlyField label="Test Label" value="" />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('displays dash when value is undefined', () => {
    render(<ReadOnlyField label="Test Label" value={undefined as any} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('displays dash when value is null', () => {
    render(<ReadOnlyField label="Test Label" value={null as any} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('applies default width when not provided', () => {
    render(<ReadOnlyField label="Test Label" value="Test Value" />);
    const container = screen.getByText('Test Label').closest('.read-only-field');
    expect(container).toHaveStyle('width: 219px');
  });

  it('applies custom width when provided', () => {
    const customWidth = '300px';
    render(<ReadOnlyField label="Test Label" value="Test Value" width={customWidth} />);
    const container = screen.getByText('Test Label').closest('.read-only-field');
    expect(container).toHaveStyle(`width: ${customWidth}`);
  });

  it('applies correct styling classes', () => {
    render(<ReadOnlyField label="Test Label" value="Test Value" />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('read-only-field__label');
  });

  it('renders with all props correctly', () => {
    const props = {
      label: 'Custom Label',
      value: 'Custom Value',
      width: '500px'
    };
    
    render(<ReadOnlyField {...props} />);
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.getByText('Custom Value')).toBeInTheDocument();
    
    const container = screen.getByText('Custom Label').closest('.read-only-field');
    expect(container).toHaveStyle('width: 500px');
    
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('read-only-field__label');
  });

  it('handles long text values correctly', () => {
    const longValue = 'This is a very long value that should be displayed correctly in the read-only field';
    render(<ReadOnlyField label="Test Label" value={longValue} />);
    expect(screen.getByText(longValue)).toBeInTheDocument();
  });

  it('handles special characters in value', () => {
    const specialValue = 'FY 19-20 & Special Characters @#$%';
    render(<ReadOnlyField label="Test Label" value={specialValue} />);
    expect(screen.getByText(specialValue)).toBeInTheDocument();
  });

  it('handles numeric values correctly', () => {
    const numericValue = '2023';
    render(<ReadOnlyField label="Year" value={numericValue} />);
    expect(screen.getByText(numericValue)).toBeInTheDocument();
  });

  it('handles boolean values correctly', () => {
    render(<ReadOnlyField label="Boolean" value="true" />);
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('maintains proper structure with label and value elements', () => {
    render(<ReadOnlyField label="Test Label" value="Test Value" />);
    
    const label = screen.getByText('Test Label');
    const value = screen.getByText('Test Value');
    
    expect(label).toHaveClass('read-only-field__label');
    expect(value).toHaveClass('read-only-field__value');
  });

  it('applies correct CSS classes', () => {
    render(<ReadOnlyField label="Test Label" value="Test Value" />);
    
    const container = screen.getByText('Test Label').closest('.read-only-field');
    expect(container).toHaveClass('read-only-field');
    
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('read-only-field__label');
    
    const value = screen.getByText('Test Value');
    expect(value).toHaveClass('read-only-field__value');
  });
});
