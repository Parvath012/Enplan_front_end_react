import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TeamGroupManagement from '../../../src/components/teamGroup/TeamGroupManagement';

// Mock TeamGroupCard
jest.mock('../../../src/components/teamGroup/TeamGroupCard', () => {
  return function MockTeamGroupCard({ teamGroup, onToggle, onMenuAction }: any) {
    return (
      <div data-testid="team-group-card" data-group-id={teamGroup.id}>
        <div>{teamGroup.name}</div>
        <button onClick={() => onToggle?.(teamGroup.id, !teamGroup.isActive)}>Toggle</button>
        <button onClick={() => onMenuAction?.('view', teamGroup)}>View</button>
      </div>
    );
  };
});

const mockGroups = [
  {
    id: '1',
    name: 'Team A',
    description: 'Description A',
    createdDate: '2023-01-01',
    lastUpdatedDate: '2023-01-02',
    isActive: true,
    teamMembers: [],
  },
  {
    id: '2',
    name: 'Team B',
    description: 'Description B',
    createdDate: '2023-01-01',
    lastUpdatedDate: '2023-01-02',
    isActive: false,
    teamMembers: [],
  },
];

describe('TeamGroupManagement', () => {
  let store: ReturnType<typeof configureStore>;
  const mockOnToggle = jest.fn();
  const mockOnMenuAction = jest.fn();

  beforeEach(() => {
    store = configureStore({
      reducer: {
        groups: (state = { groups: mockGroups, loading: false, error: null }, action) => state,
      },
    });
    jest.clearAllMocks();
  });

  const renderComponent = (searchTerm = '') => {
    return render(
      <Provider store={store}>
        <TeamGroupManagement
          searchTerm={searchTerm}
          onToggle={mockOnToggle}
          onMenuAction={mockOnMenuAction}
        />
      </Provider>
    );
  };

  it('should render team group management', () => {
    renderComponent();
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('should render all groups', () => {
    renderComponent();
    const cards = screen.getAllByTestId('team-group-card');
    expect(cards).toHaveLength(2);
  });

  it('should filter groups by search term', () => {
    renderComponent('Team A');
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.queryByText('Team B')).not.toBeInTheDocument();
  });

  it('should show no results message when search has no matches', () => {
    renderComponent('NonExistent');
    expect(screen.getByText(/no groups match your search criteria/i)).toBeInTheDocument();
  });

  it('should show empty state when no groups exist', () => {
    const emptyStore = configureStore({
      reducer: {
        groups: (state = { groups: [], loading: false, error: null }, action) => state,
      },
    });
    render(
      <Provider store={emptyStore}>
        <TeamGroupManagement />
      </Provider>
    );
    expect(screen.getByText(/no groups found/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const loadingStore = configureStore({
      reducer: {
        groups: (state = { groups: [], loading: true, error: null }, action) => state,
      },
    });
    render(
      <Provider store={loadingStore}>
        <TeamGroupManagement />
      </Provider>
    );
    expect(screen.getByText(/loading groups/i)).toBeInTheDocument();
  });

  it('should call onToggle when group is toggled', () => {
    renderComponent();
    const toggleButtons = screen.getAllByText('Toggle');
    fireEvent.click(toggleButtons[0]);
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('should call onMenuAction when menu action is triggered', () => {
    renderComponent();
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    expect(mockOnMenuAction).toHaveBeenCalledWith('view', expect.any(Object));
  });

  it('should handle case-insensitive search', () => {
    renderComponent('team a');
    expect(screen.getByText('Team A')).toBeInTheDocument();
  });

  it('should pass searchTerm to TeamGroupCard', () => {
    renderComponent('Team');
    const cards = screen.getAllByTestId('team-group-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});

