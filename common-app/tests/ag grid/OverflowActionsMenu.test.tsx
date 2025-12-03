import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverflowActionsMenu from '../../src/ag grid/OverflowActionsMenu';

describe('OverflowActionsMenu', () => {
  it('opens menu and triggers onActionClick then closes', async () => {
    const actions = [
      { label: 'Edit', action: 'edit' },
      { label: 'Delete', action: 'delete' },
    ];
    const onActionClick = jest.fn();
    render(<OverflowActionsMenu actions={actions} row={{ id: 1 }} onActionClick={onActionClick} />);

    await userEvent.click(screen.getByRole('button', { name: /more/i }));
    const edit = await screen.findByText('Edit');
    await userEvent.click(edit);
    expect(onActionClick).toHaveBeenCalledWith('edit', { id: 1 });
  });
});


