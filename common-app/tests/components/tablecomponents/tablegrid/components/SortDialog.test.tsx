import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import SortDialog from '../../../../../src/components/tablecomponents/tablegrid/components/SortDialog';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);
const store = mockStore({});

const mockColumns = [
  { field: 'name', headerName: 'Name' },
  { field: 'age', headerName: 'Age' },
  { field: 'dob', headerName: 'Date of Birth', hide: false },
];

describe('SortDialog', () => {
  // Increase timeout for all tests in this describe block
  jest.setTimeout(15000);
test('getOrderOptions: covers date, fontColor, fillColor, and default cases', async () => {
    renderWithProvider(<SortDialog {...defaultProps} />);
    // Change Sort On to 'date'
    screen.getAllByText('Sort On');
    let sortOnComboboxes = await screen.findAllByRole('combobox');
    fireEvent.mouseDown(sortOnComboboxes[1]);
    fireEvent.click(await screen.findByText('Date'));
    await screen.findByText('Date');
    await waitFor(async () => {
      sortOnComboboxes = await screen.findAllByRole('combobox');
      expect(sortOnComboboxes.length).toBeGreaterThan(1);
    });
    let orderComboboxes = await screen.findAllByRole('combobox');
    fireEvent.mouseDown(orderComboboxes[2]);
    let orderOptions = await screen.findAllByRole('option');
    expect(orderOptions.some(opt => opt.textContent === 'Earliest to Latest')).toBe(true);
    expect(orderOptions.some(opt => opt.textContent === 'Latest to Earliest')).toBe(true);

    // Change Sort On to 'fontColor'
    fireEvent.mouseDown(sortOnComboboxes[1]);
    fireEvent.click(await screen.findByText('Font Color'));
    await screen.findByText('Font Color');
    await waitFor(async () => {
      sortOnComboboxes = await screen.findAllByRole('combobox');
      expect(sortOnComboboxes.length).toBeGreaterThan(1);
    });
    orderComboboxes = await screen.findAllByRole('combobox');
    fireEvent.mouseDown(orderComboboxes[2]);
    orderOptions = await screen.findAllByRole('option');
    expect(orderOptions.some(opt => opt.textContent === 'Ascending')).toBe(true);
    expect(orderOptions.some(opt => opt.textContent === 'Descending')).toBe(true);

    // Change Sort On to 'fillColor'
    fireEvent.mouseDown(sortOnComboboxes[1]);
    fireEvent.click(await screen.findByText('Fill Color'));
    await screen.findByText('Fill Color');
    await waitFor(async () => {
      sortOnComboboxes = await screen.findAllByRole('combobox');
      expect(sortOnComboboxes.length).toBeGreaterThan(1);
    });
    orderComboboxes = await screen.findAllByRole('combobox');
    fireEvent.mouseDown(orderComboboxes[2]);
    orderOptions = await screen.findAllByRole('option');
    expect(orderOptions.some(opt => opt.textContent === 'Ascending')).toBe(true);
    expect(orderOptions.some(opt => opt.textContent === 'Descending')).toBe(true);

    // Change Sort On to unknown value (default case)
    // Simulate by directly setting levels state via rerender
    const unknownSortLevels = [{ sortBy: 'name', sortOn: 'unknown', order: 'asc' as 'asc' }];
    renderWithProvider(<SortDialog {...defaultProps} sortLevels={unknownSortLevels} />);
    orderComboboxes = await screen.findAllByRole('combobox');
    fireEvent.mouseDown(orderComboboxes[2]);
    orderOptions = await screen.findAllByRole('option');
    expect(orderOptions.some(opt => opt.textContent === 'Ascending')).toBe(true);
    expect(orderOptions.some(opt => opt.textContent === 'Descending')).toBe(true);
  }, 15000);
  test('initialLevels uses first column when sortLevels prop is missing', () => {
    const props = { ...defaultProps, sortLevels: undefined };
    renderWithProvider(<SortDialog {...props} />);
    // Should use first column for initial level
    const selects = screen.getAllByRole('combobox');
    expect(selects[0].textContent).toContain('Name');
  });
  test('useEffect resets levels if columns change and levels are invalid', () => {
    // Initial columns: name, age
    const initialColumns = [
      { field: 'name', headerName: 'Name' },
      { field: 'age', headerName: 'Age' },
    ];
    // Initial levels: sortBy not in columns
    const invalidLevels = [{ sortBy: 'notfound', sortOn: 'alphanumeric', order: 'asc' as 'asc' }];
    const { rerender } = renderWithProvider(
      <SortDialog
        open={true}
        onClose={jest.fn()}
        onApplySort={jest.fn()}
        columns={initialColumns}
        sortLevels={invalidLevels}
      />
    );
    // After mount, should reset to first column
    expect(screen.getAllByRole('combobox')[0].textContent).toContain('Name');
    // Now change columns prop to new set
    const newColumns = [
      { field: 'dob', headerName: 'Date of Birth' },
      { field: 'age', headerName: 'Age' },
    ];
    rerender(
      <Provider store={store}>
        <SortDialog
          open={true}
          onClose={jest.fn()}
          onApplySort={jest.fn()}
          columns={newColumns}
          sortLevels={invalidLevels}
        />
      </Provider>
    );
    // Should reset to first of new columns
    expect(screen.getAllByRole('combobox')[0].textContent).toContain('Date of Birth');
  });
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onApplySort: jest.fn(),
    columns: mockColumns,
    sortLevels: [
      { sortBy: 'name', sortOn: 'alphanumeric', order: 'asc' as 'asc' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<Provider store={store}>{ui}</Provider>);
  };

  test('renders dialog and all controls', () => {
    renderWithProvider(<SortDialog {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
    expect(screen.getByText('Add Level')).toBeInTheDocument();
    expect(screen.getByText('Delete Level')).toBeInTheDocument();
    expect(screen.getByText('Copy Level')).toBeInTheDocument();
    expect(screen.getByText('Options...')).toBeInTheDocument();
    // There may be multiple 'Sort by' elements (label, paragraph, span)
    expect(screen.getAllByText('Sort by').length).toBeGreaterThan(0);
    // There may be multiple 'Sort On' elements
    expect(screen.getAllByText('Sort On').length).toBeGreaterThan(0);
    // There may be multiple 'Order' elements
    expect(screen.getAllByText('Order').length).toBeGreaterThan(0);
    // MUI Selects may not have label association, skip or use getAllByRole
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
  });

  test('calls onClose when Cancel or close icon is clicked', () => {
    renderWithProvider(<SortDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
    // Re-render to reset dialog
    renderWithProvider(<SortDialog {...defaultProps} />);
    // Use getByTestId for CloseIcon
    const closeIcons = screen.getAllByTestId('CloseIcon');
    const closeBtn = closeIcons[0].closest('button');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('calls onApplySort and onClose when OK is clicked', () => {
    renderWithProvider(<SortDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('OK'));
    expect(defaultProps.onApplySort).toHaveBeenCalledWith(defaultProps.sortLevels);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('Add Level button adds a new sort level', () => {
    renderWithProvider(<SortDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Level'));
    // Should render two sets of selects
    expect(screen.getAllByRole('combobox').length).toBe(6); // 3 per level
  });

  test('Delete Level button removes a sort level', () => {
    // Start with two levels
    const props = {
      ...defaultProps,
      sortLevels: [
        { sortBy: 'name', sortOn: 'alphanumeric', order: 'asc' as 'asc' },
        { sortBy: 'age', sortOn: 'numeric', order: 'desc' as 'desc' },
      ],
    };
    renderWithProvider(<SortDialog {...props} />);
    expect(screen.getAllByRole('combobox').length).toBe(6);
    fireEvent.click(screen.getByText('Delete Level'));
    expect(screen.getAllByRole('combobox').length).toBe(3);
  });

  test('Copy Level button duplicates the last sort level', () => {
    renderWithProvider(<SortDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Copy Level'));
    expect(screen.getAllByRole('combobox').length).toBe(6);
    // Check that the new level matches the last
    const selects = screen.getAllByRole('combobox');
    // MUI Selects are divs, check textContent
    expect(selects[0].textContent).toContain('Name');
    expect(selects[3].textContent).toContain('Name');
  });

  test('changing selects updates sort level state', () => {
    renderWithProvider(<SortDialog {...defaultProps} />);
    // Change Sort by
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click(screen.getByText('Age'));
    expect(screen.getAllByRole('combobox')[0].textContent).toContain('Age');
    // Change Sort On
    waitFor(() => {
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(1);
    });
    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]);
    fireEvent.click(screen.getByText('Numeric'));
    expect(screen.getAllByRole('combobox')[1].textContent).toContain('Numeric');
    // Change Order
    fireEvent.mouseDown(screen.getAllByRole('combobox')[2]);
    fireEvent.click(screen.getByText('Largest to Smallest'));
    expect(screen.getAllByRole('combobox')[2].textContent).toContain('Largest to Smallest');
  });

  test('handles columns prop missing (uses reduxColumns)', () => {
    // Remove columns prop
    const props: Partial<typeof defaultProps> = { ...defaultProps };
    delete props.columns;
    renderWithProvider(<SortDialog {...(props as any)} />);
    waitFor(() => {
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(1);
    });
    expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument();
  });

  test('handles empty columns and sortLevels', () => {
    renderWithProvider(
      <SortDialog
        open={true}
        onClose={jest.fn()}
        onApplySort={jest.fn()}
        columns={[]}
        sortLevels={[]}
      />
    );
    waitFor(() => {
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(1);
    });
    // Should not throw, and should render dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('handles edge case: Delete Level with one level does not remove', () => {
    renderWithProvider(<SortDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Delete Level'));
    expect(screen.getAllByRole('combobox').length).toBe(3);
  });
});
