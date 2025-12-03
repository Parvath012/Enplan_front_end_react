import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormFieldLabel from '../../../src/components/ProcessGroupBox/FormFieldLabel';

describe('FormFieldLabel', () => {
  it('should render label with children', () => {
    render(
      <FormFieldLabel htmlFor="test-field">
        Test Label
      </FormFieldLabel>
    );
    
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'test-field');
  });

  it('should apply correct styles to label', () => {
    render(
      <FormFieldLabel htmlFor="test-field">
        Test Label
      </FormFieldLabel>
    );
    
    const label = screen.getByText('Test Label');
    expect(label).toHaveStyle({
      fontSize: '12px',
      fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#5F6368',
      fontWeight: '500'
    });
  });

  it('should render complex children', () => {
    render(
      <FormFieldLabel htmlFor="test-field">
        <span>Complex</span> Label
      </FormFieldLabel>
    );
    
    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('should have correct htmlFor attribute', () => {
    render(
      <FormFieldLabel htmlFor="different-field">
        Label Text
      </FormFieldLabel>
    );
    
    const label = screen.getByText('Label Text');
    expect(label).toHaveAttribute('for', 'different-field');
  });
});

