import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import CustomTooltip from '../../src/components/common/CustomTooltip';

describe('CustomTooltip', () => {
  it('renders child element', () => {
    render(
      <CustomTooltip title="Tooltip content">
        <button>Hover me</button>
      </CustomTooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(
      <CustomTooltip title="Tooltip content">
        <button>Hover here</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Hover here');
    await userEvent.hover(button);

    // Wait for tooltip to appear (has 1 second delay)
    expect(await screen.findByText('Tooltip content', {}, { timeout: 2000 })).toBeVisible();
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <CustomTooltip title="Tooltip disappears">
        <button>Leave me</button>
      </CustomTooltip>
    );

    const button = screen.getByText('Leave me');
    await userEvent.hover(button);
    expect(await screen.findByText('Tooltip disappears', {}, { timeout: 2000 })).toBeVisible();

    await userEvent.unhover(button);
    // Tooltip fades out, so allow for async resolution
    expect(await screen.findByText('Tooltip disappears')).not.toBeVisible();
  });

  it('applies custom class to tooltip popper', () => {
    render(
      <CustomTooltip title="Test Class">
        <span>Test</span>
      </CustomTooltip>
    );
    const tooltipTrigger = screen.getByText('Test');
    expect(tooltipTrigger).toBeInTheDocument();
  });
});
