/**
 * Tests for UserHierarchyFooter
 */
import React from 'react';
import { render } from '@testing-library/react';
import UserHierarchyFooter from '../../../src/components/userHierarchy/UserHierarchyFooter';

describe('UserHierarchyFooter', () => {
  it('should render without crashing', () => {
    const { container } = render(<UserHierarchyFooter />);
    expect(container).toBeInTheDocument();
  });

  it('should render with default props', () => {
    const { container } = render(<UserHierarchyFooter />);
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveStyle({
      height: '46px',
      display: 'flex'
    });
  });

  it('should accept totalCount prop (even though not used)', () => {
    const { container } = render(<UserHierarchyFooter totalCount={10} />);
    expect(container).toBeInTheDocument();
  });

  it('should accept zoomPercentage prop (even though not used)', () => {
    const { container } = render(<UserHierarchyFooter zoomPercentage={50} />);
    expect(container).toBeInTheDocument();
  });
});

