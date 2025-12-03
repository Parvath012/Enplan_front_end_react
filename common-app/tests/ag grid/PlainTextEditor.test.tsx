import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlainTextEditor from '../../src/ag grid/PlainTextEditor';

describe('PlainTextEditor', () => {
  it('focuses input, updates value, and commits on Enter', async () => {
    const stopEditing = jest.fn();
    const api = { stopEditing: jest.fn() };

    render(<PlainTextEditor value="start" stopEditing={stopEditing} api={api} />);

    const input = screen.getByRole('textbox');
    expect(document.activeElement).toBe(input);

    await userEvent.clear(input);
    await userEvent.type(input, 'new');
    // on value change, effect should call api.stopEditing
    expect(api.stopEditing).toHaveBeenCalled();

    await userEvent.type(input, '{enter}');
    expect(stopEditing).toHaveBeenCalled();
  });
});


