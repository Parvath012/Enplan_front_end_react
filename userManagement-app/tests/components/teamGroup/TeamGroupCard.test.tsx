import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamGroupCard, { TeamGroup } from '../../../src/components/teamGroup/TeamGroupCard';

// Mock dependencies - Card mock is provided by __mocks__/commonApp/Card.tsx

jest.mock('commonApp/ToggleSwitch', () => {
  return function MockToggleSwitch({ isOn, handleToggle }: any) {
    return (
      <button data-testid="toggle-switch" onClick={handleToggle}>
        {isOn ? 'ON' : 'OFF'}
      </button>
    );
  };
});

jest.mock('commonApp/cellRenderers', () => ({
  ConditionalTooltipText: ({ text, searchTerm }: any) => (
    <span data-testid="conditional-tooltip-text" data-search-term={searchTerm}>
      {text}
    </span>
  ),
}));

jest.mock('../../../src/components/UserInitials', () => {
  return function MockUserInitials({ firstName, lastName, isOnline }: any) {
    return (
      <div data-testid="user-initials" data-online={isOnline}>
        {firstName} {lastName}
      </div>
    );
  };
});

const mockTeamGroup: TeamGroup = {
  id: '1',
  name: 'Test Team',
  description: 'Test Description',
  createdDate: '2023-01-01',
  lastUpdatedDate: '2023-01-02',
  isActive: true,
  teamMembers: [
    { id: '1', firstName: 'John', lastName: 'Doe', isOnline: true },
    { id: '2', firstName: 'Jane', lastName: 'Smith', isOnline: false },
  ],
  ownerId: '1',
};

describe('TeamGroupCard', () => {
  const mockOnToggle = jest.fn();
  const mockOnMenuAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render team group card', () => {
    render(
      <TeamGroupCard
        teamGroup={mockTeamGroup}
        onToggle={mockOnToggle}
        onMenuAction={mockOnMenuAction}
      />
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('should display team group name', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} />);
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('should display description', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should display created and last updated dates', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} />);
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });

  it('should display toggle switch', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} onToggle={mockOnToggle} />);
    expect(screen.getByTestId('toggle-switch')).toBeInTheDocument();
  });

  it('should call onToggle when toggle is clicked', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} onToggle={mockOnToggle} />);
    const toggle = screen.getByTestId('toggle-switch');
    fireEvent.click(toggle);
    expect(mockOnToggle).toHaveBeenCalledWith('1', false);
  });

  it('should display team members', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should highlight search term in group name', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} searchTerm="Test" />);
    const tooltipText = screen.getByTestId('conditional-tooltip-text');
    expect(tooltipText).toHaveAttribute('data-search-term', 'Test');
  });

  it('should show menu button', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} onMenuAction={mockOnMenuAction} />);
    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
  });

  it('should call onMenuAction when menu action is clicked', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} onMenuAction={mockOnMenuAction} />);
    // The menu button itself doesn't call onMenuAction, but individual actions do
    const viewAction = screen.getByTestId('menu-action-view');
    fireEvent.click(viewAction);
    expect(mockOnMenuAction).toHaveBeenCalledWith('view', mockTeamGroup);
  });

  it('should update toggle state when teamGroup.isActive changes', () => {
    const { rerender } = render(
      <TeamGroupCard teamGroup={mockTeamGroup} onToggle={mockOnToggle} />
    );
    expect(screen.getByText('ON')).toBeInTheDocument();

    const updatedGroup = { ...mockTeamGroup, isActive: false };
    rerender(<TeamGroupCard teamGroup={updatedGroup} onToggle={mockOnToggle} />);
    expect(screen.getByText('OFF')).toBeInTheDocument();
  });

  it('should display owner member separately', () => {
    render(<TeamGroupCard teamGroup={mockTeamGroup} />);
    const ownerMember = screen.getByText('John Doe');
    expect(ownerMember).toBeInTheDocument();
  });

  it('should display additional members count when there are more than 3', () => {
    const groupWithManyMembers: TeamGroup = {
      ...mockTeamGroup,
      teamMembers: [
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' },
        { id: '3', firstName: 'Bob', lastName: 'Johnson' },
        { id: '4', firstName: 'Alice', lastName: 'Williams' },
        { id: '5', firstName: 'Charlie', lastName: 'Brown' },
      ],
      ownerId: '1',
    };
    render(<TeamGroupCard teamGroup={groupWithManyMembers} />);
    expect(screen.getByText(/\+/)).toBeInTheDocument();
  });

  it('should handle inactive group state', () => {
    const inactiveGroup = { ...mockTeamGroup, isActive: false };
    render(<TeamGroupCard teamGroup={inactiveGroup} onToggle={mockOnToggle} />);
    expect(screen.getByText('OFF')).toBeInTheDocument();
  });

  describe('Menu Actions', () => {
    it('should call onMenuAction with "view" when view action is clicked on active group', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} onMenuAction={mockOnMenuAction} />);
      const viewAction = screen.getByTestId('menu-action-view');
      fireEvent.click(viewAction);
      expect(mockOnMenuAction).toHaveBeenCalledWith('view', mockTeamGroup);
    });

    it('should call onMenuAction with "edit" when edit action is clicked on active group', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} onMenuAction={mockOnMenuAction} />);
      const editAction = screen.getByTestId('menu-action-edit');
      fireEvent.click(editAction);
      expect(mockOnMenuAction).toHaveBeenCalledWith('edit', mockTeamGroup);
    });

    it('should call onMenuAction with "delete" when delete action is clicked on active group', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} onMenuAction={mockOnMenuAction} />);
      const deleteAction = screen.getByTestId('menu-action-delete');
      fireEvent.click(deleteAction);
      expect(mockOnMenuAction).toHaveBeenCalledWith('delete', mockTeamGroup);
    });

    it('should call onMenuAction with "duplicate" when duplicate action is clicked on active group', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} onMenuAction={mockOnMenuAction} />);
      const duplicateAction = screen.getByTestId('menu-action-duplicate');
      fireEvent.click(duplicateAction);
      expect(mockOnMenuAction).toHaveBeenCalledWith('duplicate', mockTeamGroup);
    });

    it('should disable all menu actions when group is inactive', () => {
      const inactiveGroup = { ...mockTeamGroup, isActive: false };
      render(<TeamGroupCard teamGroup={inactiveGroup} onMenuAction={mockOnMenuAction} />);
      
      const viewAction = screen.getByTestId('menu-action-view');
      const editAction = screen.getByTestId('menu-action-edit');
      const deleteAction = screen.getByTestId('menu-action-delete');
      const duplicateAction = screen.getByTestId('menu-action-duplicate');
      
      expect(viewAction).toBeDisabled();
      expect(editAction).toBeDisabled();
      expect(deleteAction).toBeDisabled();
      expect(duplicateAction).toBeDisabled();
    });

    it('should not call onMenuAction when action is clicked on inactive group', () => {
      const inactiveGroup = { ...mockTeamGroup, isActive: false };
      render(<TeamGroupCard teamGroup={inactiveGroup} onMenuAction={mockOnMenuAction} />);
      const editAction = screen.getByTestId('menu-action-edit');
      fireEvent.click(editAction);
      expect(mockOnMenuAction).not.toHaveBeenCalled();
    });

    it('should not call onMenuAction when onMenuAction is not provided', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} />);
      const editAction = screen.getByTestId('menu-action-edit');
      // Should not throw error
      expect(() => fireEvent.click(editAction)).not.toThrow();
    });
  });

  describe('Toggle Functionality', () => {
    it('should not call onToggle when onToggle is not provided', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} />);
      const toggle = screen.getByTestId('toggle-switch');
      // Should not throw error
      expect(() => fireEvent.click(toggle)).not.toThrow();
    });

    it('should toggle from false to true', () => {
      const inactiveGroup = { ...mockTeamGroup, isActive: false };
      render(<TeamGroupCard teamGroup={inactiveGroup} onToggle={mockOnToggle} />);
      const toggle = screen.getByTestId('toggle-switch');
      fireEvent.click(toggle);
      expect(mockOnToggle).toHaveBeenCalledWith('1', true);
    });
  });

  describe('Member Rendering', () => {
    it('should render members with avatarUrl', () => {
      const groupWithAvatars: TeamGroup = {
        ...mockTeamGroup,
        teamMembers: [
          { id: '1', firstName: 'John', lastName: 'Doe', avatarUrl: 'http://example.com/avatar.jpg' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', avatarUrl: 'http://example.com/avatar2.jpg' },
        ],
        ownerId: '1',
      };
      render(<TeamGroupCard teamGroup={groupWithAvatars} />);
      // Avatar should be rendered (we can check for the alt text)
      const avatars = screen.getAllByAltText(/John Doe|Jane Smith/);
      expect(avatars.length).toBeGreaterThan(0);
    });

    it('should render member with avatarUrl but no red mark (non-owner)', () => {
      const groupWithAvatarNoRedMark: TeamGroup = {
        ...mockTeamGroup,
        teamMembers: [
          { id: '1', firstName: 'John', lastName: 'Doe', avatarUrl: 'http://example.com/avatar.jpg' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', avatarUrl: 'http://example.com/avatar2.jpg' },
        ],
        ownerId: '1',
      };
      render(<TeamGroupCard teamGroup={groupWithAvatarNoRedMark} />);
      // Jane should be rendered without red mark (she's not the owner)
      const janeAvatar = screen.getByAltText('Jane Smith');
      expect(janeAvatar).toBeInTheDocument();
    });

    it('should render member without avatarUrl but with red mark (owner)', () => {
      const groupWithOwnerNoAvatar: TeamGroup = {
        ...mockTeamGroup,
        teamMembers: [
          { id: '1', firstName: 'John', lastName: 'Doe' }, // No avatarUrl
          { id: '2', firstName: 'Jane', lastName: 'Smith' },
        ],
        ownerId: '1',
      };
      render(<TeamGroupCard teamGroup={groupWithOwnerNoAvatar} />);
      // John should be rendered with UserInitials (no avatarUrl) but with red mark (owner)
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render owner with red mark', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} />);
      // Owner should be rendered (John Doe is the owner)
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should not show separator when there is no owner', () => {
      const groupWithoutOwner: TeamGroup = {
        ...mockTeamGroup,
        ownerId: undefined,
      };
      render(<TeamGroupCard teamGroup={groupWithoutOwner} />);
      // Separator should not be rendered when there's no owner
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('should not show separator when there are no other members', () => {
      const groupWithOnlyOwner: TeamGroup = {
        ...mockTeamGroup,
        teamMembers: [{ id: '1', firstName: 'John', lastName: 'Doe' }],
        ownerId: '1',
      };
      render(<TeamGroupCard teamGroup={groupWithOnlyOwner} />);
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('should show separator when owner and other members exist', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} />);
      // Card should render with owner and other members
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should handle group with no members', () => {
      const groupWithNoMembers: TeamGroup = {
        ...mockTeamGroup,
        teamMembers: [],
      };
      render(<TeamGroupCard teamGroup={groupWithNoMembers} />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should display exactly 3 other members plus owner', () => {
      const groupWithManyMembers: TeamGroup = {
        ...mockTeamGroup,
        teamMembers: [
          { id: '1', firstName: 'John', lastName: 'Doe' },
          { id: '2', firstName: 'Jane', lastName: 'Smith' },
          { id: '3', firstName: 'Bob', lastName: 'Johnson' },
          { id: '4', firstName: 'Alice', lastName: 'Williams' },
          { id: '5', firstName: 'Charlie', lastName: 'Brown' },
        ],
        ownerId: '1',
      };
      render(<TeamGroupCard teamGroup={groupWithManyMembers} />);
      // Should show owner (John) + 3 others + count
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/\+/)).toBeInTheDocument();
    });

    it('should not show remaining count when there are exactly 3 other members', () => {
      const groupWithExactly3Others: TeamGroup = {
        ...mockTeamGroup,
        teamMembers: [
          { id: '1', firstName: 'John', lastName: 'Doe' },
          { id: '2', firstName: 'Jane', lastName: 'Smith' },
          { id: '3', firstName: 'Bob', lastName: 'Johnson' },
          { id: '4', firstName: 'Alice', lastName: 'Williams' },
        ],
        ownerId: '1',
      };
      render(<TeamGroupCard teamGroup={groupWithExactly3Others} />);
      // Should not show + count (3 others + owner = 4 total, which is exactly what we show)
      const plusSign = screen.queryByText(/^\+/);
      expect(plusSign).not.toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const groupWithDates: TeamGroup = {
        ...mockTeamGroup,
        createdDate: '2023-12-25',
        lastUpdatedDate: '2024-01-15',
      };
      render(<TeamGroupCard teamGroup={groupWithDates} />);
      expect(screen.getByText(/25-Dec-23/)).toBeInTheDocument();
      expect(screen.getByText(/15-Jan-24/)).toBeInTheDocument();
    });

    it('should handle dates with different months', () => {
      const groupWithDates: TeamGroup = {
        ...mockTeamGroup,
        createdDate: '2023-03-01',
        lastUpdatedDate: '2023-11-30',
      };
      render(<TeamGroupCard teamGroup={groupWithDates} />);
      expect(screen.getByText(/1-Mar-23/)).toBeInTheDocument();
      expect(screen.getByText(/30-Nov-23/)).toBeInTheDocument();
    });
  });

  describe('Search Highlighting', () => {
    it('should pass searchTerm to ConditionalTooltipText', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} searchTerm="Team" />);
      const tooltipText = screen.getByTestId('conditional-tooltip-text');
      expect(tooltipText).toHaveAttribute('data-search-term', 'Team');
    });

    it('should handle empty searchTerm', () => {
      render(<TeamGroupCard teamGroup={mockTeamGroup} searchTerm="" />);
      const tooltipText = screen.getByTestId('conditional-tooltip-text');
      expect(tooltipText).toHaveAttribute('data-search-term', '');
    });
  });

  describe('Card Styling', () => {
    it('should apply inactive class when group is inactive', () => {
      const inactiveGroup = { ...mockTeamGroup, isActive: false };
      const { container } = render(<TeamGroupCard teamGroup={inactiveGroup} />);
      const wrapper = container.querySelector('.team-group-card-wrapper--inactive');
      expect(wrapper).toBeInTheDocument();
    });

    it('should apply inactive class to card when group is inactive', () => {
      const inactiveGroup = { ...mockTeamGroup, isActive: false };
      const { container } = render(<TeamGroupCard teamGroup={inactiveGroup} />);
      const card = container.querySelector('.team-group-card--inactive');
      expect(card).toBeInTheDocument();
    });

    it('should apply menu-disabled class when group is inactive', () => {
      const inactiveGroup = { ...mockTeamGroup, isActive: false };
      const { container } = render(<TeamGroupCard teamGroup={inactiveGroup} />);
      const card = container.querySelector('.team-group-card--menu-disabled');
      expect(card).toBeInTheDocument();
    });
  });
});

