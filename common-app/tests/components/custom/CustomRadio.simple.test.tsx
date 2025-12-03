import React from 'react';
import { render } from '@testing-library/react';
import CustomRadio from '../../../src/components/custom/CustomRadio';

// Simple test to check if the component can be imported
describe('CustomRadio Simple Test', () => {
  it('should be able to import CustomRadio', () => {
    // This test will fail if the import doesn't work
    expect(CustomRadio).toBeDefined();
  });
});
