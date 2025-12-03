import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Typography } from '@mui/material';
import Card, { CardAction, CardSection } from '../../../../src/components/common/Card/Card';

describe('Card Component', () => {
  const defaultProps = {
    title: 'Test Card',
    content: <Typography>Test Content</Typography>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with basic props', () => {
      render(<Card {...defaultProps} />);
      
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render without title when title is not provided', () => {
      render(<Card content={<Typography>Content Only</Typography>} />);
      
      expect(screen.getByText('Content Only')).toBeInTheDocument();
      expect(screen.queryByText('Test Card')).not.toBeInTheDocument();
    });

    it('should render with string title', () => {
      render(<Card title="String Title" content={<Typography>Content</Typography>} />);
      
      expect(screen.getByText('String Title')).toBeInTheDocument();
    });

    it('should render with ReactNode title', () => {
      const titleNode = <Typography data-testid="custom-title">Custom Title</Typography>;
      render(<Card title={titleNode} content={<Typography>Content</Typography>} />);
      
      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });

    it('should render with titleRenderer when data is provided', () => {
      const data = { name: 'Test Name' };
      const titleRenderer = (d: typeof data) => <Typography>{d.name}</Typography>;
      
      render(
        <Card
          data={data}
          titleRenderer={titleRenderer}
          content={<Typography>Content</Typography>}
        />
      );
      
      expect(screen.getByText('Test Name')).toBeInTheDocument();
    });

    it('should not render title when titleRenderer returns function', () => {
      const data = { name: 'Test' };
      const titleRenderer = () => (() => <Typography>Should not render</Typography>) as any;
      
      render(
        <Card
          data={data}
          titleRenderer={titleRenderer}
          content={<Typography>Content</Typography>}
        />
      );
      
      expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
    });

    it('should render with sections', () => {
      const sections: CardSection[] = [
        {
          id: 'section1',
          content: <Typography>Section 1</Typography>,
        },
        {
          id: 'section2',
          content: <Typography>Section 2</Typography>,
        },
      ];
      
      render(<Card sections={sections} />);
      
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('should render with function content when data is provided', () => {
      const data = { value: 'Test Value' };
      const content = (d: typeof data) => <Typography>{d.value}</Typography>;
      
      render(<Card data={data} content={content} />);
      
      expect(screen.getByText('Test Value')).toBeInTheDocument();
    });

    it('should render with ReactNode content', () => {
      render(<Card content={<Typography>Direct Content</Typography>} />);
      
      expect(screen.getByText('Direct Content')).toBeInTheDocument();
    });

    it('should render footer', () => {
      const footer = <Typography>Footer Content</Typography>;
      
      render(<Card {...defaultProps} footer={footer} />);
      
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('should render menu button when showMenuButton is true', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = screen.getByRole('button', { hidden: true }) || 
        document.querySelector('svg[viewBox="0 0 18 18"]');
      expect(menuButton).toBeInTheDocument();
    });

    it('should not render menu button when showMenuButton is false', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} showMenuButton={false} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]');
      expect(menuButton).not.toBeInTheDocument();
    });

    it('should render loading overlay when loading is true', () => {
      render(<Card {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render loading overlay when loading is false', () => {
      render(<Card {...defaultProps} loading={false} />);
      
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Sizing', () => {
    it('should apply small size', () => {
      const { container } = render(<Card {...defaultProps} size="small" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ width: '280px', height: '160px' });
    });

    it('should apply medium size', () => {
      const { container } = render(<Card {...defaultProps} size="medium" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ width: '360px', height: '200px' });
    });

    it('should apply large size', () => {
      const { container } = render(<Card {...defaultProps} size="large" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ width: '440px', height: '240px' });
    });

    it('should apply custom size', () => {
      const { container } = render(<Card {...defaultProps} size="custom" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ width: 'auto', height: 'auto' });
    });

    it('should apply custom width and height', () => {
      const { container } = render(
        <Card {...defaultProps} size="custom" width="500px" height="300px" />
      );
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ width: '500px', height: '300px' });
    });

    it('should apply minWidth, maxWidth, minHeight, maxHeight', () => {
      const { container } = render(
        <Card
          {...defaultProps}
          minWidth="200px"
          maxWidth="600px"
          minHeight="100px"
          maxHeight="400px"
        />
      );
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({
        minWidth: '200px',
        maxWidth: '600px',
        minHeight: '100px',
        maxHeight: '400px',
      });
    });
  });

  describe('Variants', () => {
    it('should apply default variant', () => {
      const { container } = render(<Card {...defaultProps} variant="default" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ border: '1px solid #d0d0d0' });
    });

    it('should apply outlined variant', () => {
      const { container } = render(<Card {...defaultProps} variant="outlined" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ border: '1px solid #d0d0d0' });
    });

    it('should apply elevated variant', () => {
      const { container } = render(<Card {...defaultProps} variant="elevated" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ border: 'none' });
    });

    it('should apply selected state styling', () => {
      const { container } = render(<Card {...defaultProps} selected={true} />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveStyle({ border: '1px solid #1976d2' });
      expect(card).toHaveClass('selected');
    });
  });

  describe('States', () => {
    it('should apply disabled state', () => {
      const { container } = render(<Card {...defaultProps} disabled={true} />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveClass('disabled');
      expect(card).toHaveStyle({ opacity: '0.6', cursor: 'not-allowed' });
      expect(card).toHaveAttribute('data-disabled', 'true');
    });

    it('should apply dragging state', () => {
      const { container } = render(<Card {...defaultProps} dragging={true} />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveClass('dragging');
      expect(card).toHaveStyle({ cursor: 'grabbing', transform: 'scale(1.01)' });
    });

    it('should apply selected state', () => {
      const { container } = render(<Card {...defaultProps} selected={true} />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveClass('selected');
      expect(card).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('Event Handlers', () => {
    it('should call onClick when card is clicked', () => {
      const mockOnClick = jest.fn();
      const data = { id: '1' };
      
      render(<Card {...defaultProps} data={data} onClick={mockOnClick} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      fireEvent.click(card!);
      
      expect(mockOnClick).toHaveBeenCalledWith(data, expect.any(Object));
    });

    it('should not call onClick when disabled', () => {
      const mockOnClick = jest.fn();
      
      render(<Card {...defaultProps} disabled={true} onClick={mockOnClick} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      fireEvent.click(card!);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should call onDoubleClick when card is double-clicked', () => {
      const mockOnDoubleClick = jest.fn();
      const data = { id: '1' };
      
      render(<Card {...defaultProps} data={data} onDoubleClick={mockOnDoubleClick} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      fireEvent.doubleClick(card!);
      
      expect(mockOnDoubleClick).toHaveBeenCalledWith(data, expect.any(Object));
    });

    it('should not call onDoubleClick when disabled', () => {
      const mockOnDoubleClick = jest.fn();
      
      render(<Card {...defaultProps} disabled={true} onDoubleClick={mockOnDoubleClick} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      fireEvent.doubleClick(card!);
      
      expect(mockOnDoubleClick).not.toHaveBeenCalled();
    });

    it('should call onMouseDown when card is mouse downed', () => {
      const mockOnMouseDown = jest.fn();
      const data = { id: '1' };
      
      render(<Card {...defaultProps} data={data} onMouseDown={mockOnMouseDown} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      fireEvent.mouseDown(card!);
      
      expect(mockOnMouseDown).toHaveBeenCalledWith(data, expect.any(Object));
    });

    it('should not call onMouseDown when disabled', () => {
      const mockOnMouseDown = jest.fn();
      
      render(<Card {...defaultProps} disabled={true} onMouseDown={mockOnMouseDown} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      fireEvent.mouseDown(card!);
      
      expect(mockOnMouseDown).not.toHaveBeenCalled();
    });

    it('should call onHover when mouse enters', () => {
      const mockOnHover = jest.fn();
      const data = { id: '1' };
      
      render(<Card {...defaultProps} data={data} onHover={mockOnHover} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      fireEvent.mouseEnter(card!);
      
      expect(mockOnHover).toHaveBeenCalledWith(data, true);
    });

    it('should call onHover when mouse leaves', () => {
      const mockOnHover = jest.fn();
      const data = { id: '1' };
      
      render(<Card {...defaultProps} data={data} onHover={mockOnHover} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      fireEvent.mouseLeave(card!);
      
      expect(mockOnHover).toHaveBeenCalledWith(data, false);
    });

    it('should not call onHover when onHover is not provided', () => {
      render(<Card {...defaultProps} />);
      
      const card = screen.getByText('Test Card').closest('.common-card');
      
      // Should not throw error
      fireEvent.mouseEnter(card!);
      fireEvent.mouseLeave(card!);
    });
  });

  describe('Menu Actions', () => {
    it('should open menu when menu button is clicked', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      expect(screen.getByText('Action 1')).toBeInTheDocument();
    });

    it('should close menu when menu item is clicked', async () => {
      const mockAction = jest.fn();
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: mockAction },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      const menuItem = screen.getByText('Action 1');
      fireEvent.click(menuItem);
      
      await waitFor(() => {
        expect(screen.queryByText('Action 1')).not.toBeInTheDocument();
      });
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should call action onClick with data when menu item is clicked', () => {
      const mockAction = jest.fn();
      const data = { id: '1', name: 'Test' };
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: mockAction },
      ];
      
      render(
        <Card
          {...defaultProps}
          data={data}
          showMenuButton={true}
          actions={actions}
        />
      );
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      const menuItem = screen.getByText('Action 1');
      fireEvent.click(menuItem);
      
      expect(mockAction).toHaveBeenCalledWith(data);
    });

    it('should not call action onClick when action has no onClick', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1' },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      const menuItem = screen.getByText('Action 1');
      fireEvent.click(menuItem);
      
      // Should not throw error
      expect(screen.queryByText('Action 1')).not.toBeInTheDocument();
    });

    it('should disable menu item when action is disabled', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', disabled: true, onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      const menuItem = screen.getByText('Action 1').closest('.MuiMenuItem-root');
      expect(menuItem).toHaveClass('Mui-disabled');
    });

    it('should render divider when action has divider prop', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
        { id: 'action2', label: 'Action 2', divider: true, onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      const divider = document.querySelector('.common-card-menu__divider');
      expect(divider).toBeInTheDocument();
    });

    it('should not render divider for first action', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', divider: true, onClick: jest.fn() },
        { id: 'action2', label: 'Action 2', onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      // First action should not have divider rendered before it
      const dividers = document.querySelectorAll('.common-card-menu__divider');
      expect(dividers.length).toBe(0);
    });

    it('should render action icon when provided', () => {
      const icon = <span data-testid="action-icon">Icon</span>;
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', icon, onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      expect(screen.getByTestId('action-icon')).toBeInTheDocument();
    });

    it('should close menu when menu is closed', async () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} showMenuButton={true} actions={actions} />);
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      
      // Close menu by clicking outside (simulated by Menu onClose)
      const menu = document.querySelector('.common-card-menu');
      if (menu) {
        fireEvent.keyDown(menu, { key: 'Escape' });
      }
      
      await waitFor(() => {
        expect(screen.queryByText('Action 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sections', () => {
    it('should apply custom padding to section', () => {
      const sections: CardSection[] = [
        {
          id: 'section1',
          content: <Typography>Section 1</Typography>,
          padding: '12px 24px',
        },
      ];
      
      render(<Card sections={sections} />);
      
      const section = screen.getByText('Section 1').closest('.MuiBox-root');
      expect(section).toHaveStyle({ padding: '12px 24px' });
    });

    it('should apply custom backgroundColor to section', () => {
      const sections: CardSection[] = [
        {
          id: 'section1',
          content: <Typography>Section 1</Typography>,
          backgroundColor: '#f0f0f0',
        },
      ];
      
      render(<Card sections={sections} />);
      
      const section = screen.getByText('Section 1').closest('.MuiBox-root');
      expect(section).toHaveStyle({ backgroundColor: '#f0f0f0' });
    });

    it('should apply borderBottom when borderBottom is true', () => {
      const sections: CardSection[] = [
        {
          id: 'section1',
          content: <Typography>Section 1</Typography>,
          borderBottom: true,
        },
      ];
      
      render(<Card sections={sections} />);
      
      const section = screen.getByText('Section 1').closest('.MuiBox-root');
      expect(section).toHaveStyle({ borderBottom: '1px solid #e8e8e8' });
    });

    it('should not apply borderBottom when borderBottom is false', () => {
      const sections: CardSection[] = [
        {
          id: 'section1',
          content: <Typography>Section 1</Typography>,
          borderBottom: false,
        },
      ];
      
      render(<Card sections={sections} />);
      
      const section = screen.getByText('Section 1').closest('.MuiBox-root');
      expect(section).toHaveStyle({ borderBottom: 'none' });
    });
  });

  describe('Footer', () => {
    it('should render footer when footer is provided', () => {
      const footer = <Typography>Footer Text</Typography>;
      
      render(<Card {...defaultProps} footer={footer} />);
      
      expect(screen.getByText('Footer Text')).toBeInTheDocument();
    });

    it('should render footer when actions are provided', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(<Card {...defaultProps} actions={actions} />);
      
      // Footer should be rendered (even without showMenuButton)
      const footer = document.querySelector('[data-menu-container]');
      expect(footer).toBeInTheDocument();
    });

    it('should apply disabled opacity to footer when disabled', () => {
      const footer = <Typography>Footer Text</Typography>;
      
      render(<Card {...defaultProps} footer={footer} disabled={true} />);
      
      const footerContainer = screen.getByText('Footer Text').closest('.MuiBox-root');
      expect(footerContainer).toHaveStyle({ opacity: '0.6' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null title', () => {
      render(<Card title={null as any} content={<Typography>Content</Typography>} />);
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle undefined title', () => {
      render(<Card title={undefined} content={<Typography>Content</Typography>} />);
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle empty sections array', () => {
      render(<Card sections={[]} content={<Typography>Content</Typography>} />);
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle empty actions array', () => {
      render(<Card {...defaultProps} actions={[]} />);
      
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('should handle function title that is not a function', () => {
      const title = (() => <Typography>Function Title</Typography>) as any;
      
      render(<Card title={title} content={<Typography>Content</Typography>} />);
      
      // Should handle gracefully
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle content as function when data is not provided', () => {
      const content = (data: any) => <Typography>{data?.value}</Typography>;
      
      render(<Card content={content} />);
      
      // Should render nothing or handle gracefully
      expect(screen.queryByText('Test Card')).not.toBeInTheDocument();
    });

    it('should handle onClick when clicking on menu', () => {
      const mockOnClick = jest.fn();
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(
        <Card
          {...defaultProps}
          onClick={mockOnClick}
          showMenuButton={true}
          actions={actions}
        />
      );
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      // Clicking menu should not trigger card onClick
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle onClick when clicking on menu item', () => {
      const mockOnClick = jest.fn();
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(
        <Card
          {...defaultProps}
          onClick={mockOnClick}
          showMenuButton={true}
          actions={actions}
        />
      );
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      const menuItem = screen.getByText('Action 1');
      fireEvent.click(menuItem);
      
      // Clicking menu item should not trigger card onClick
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should apply custom className', () => {
      const { container } = render(<Card {...defaultProps} className="custom-class" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should apply custom headerBackgroundColor', () => {
      render(<Card {...defaultProps} headerBackgroundColor="#ff0000" />);
      
      const header = screen.getByText('Test Card').closest('.MuiBox-root');
      expect(header).toHaveStyle({ backgroundColor: '#ff0000' });
    });

    it('should apply custom footerBackgroundColor', () => {
      render(<Card {...defaultProps} footer={<Typography>Footer</Typography>} footerBackgroundColor="#00ff00" />);
      
      const footer = screen.getByText('Footer').closest('[data-menu-container]');
      expect(footer).toHaveStyle({ backgroundColor: '#00ff00' });
    });

    it('should apply custom menuClassName', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(
        <Card
          {...defaultProps}
          showMenuButton={true}
          actions={actions}
          menuClassName="custom-menu-class"
        />
      );
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      const menu = document.querySelector('.common-card-menu');
      expect(menu).toHaveClass('custom-menu-class');
    });

    it('should apply custom menuAnchorOrigin and menuTransformOrigin', () => {
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      
      render(
        <Card
          {...defaultProps}
          showMenuButton={true}
          actions={actions}
          menuAnchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          menuTransformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        />
      );
      
      const menuButton = document.querySelector('svg[viewBox="0 0 18 18"]')?.parentElement;
      fireEvent.click(menuButton!);
      
      // Menu should be rendered with custom origins
      expect(screen.getByText('Action 1')).toBeInTheDocument();
    });

    it('should set data-card-id and data-box-id attributes', () => {
      const { container } = render(<Card {...defaultProps} id="test-id" />);
      
      const card = container.querySelector('.common-card');
      expect(card).toHaveAttribute('data-card-id', 'test-id');
      expect(card).toHaveAttribute('data-box-id', 'test-id');
    });
  });

  describe('hasTitleToRender', () => {
    it('should return true when title is provided', () => {
      render(<Card title="Title" content={<Typography>Content</Typography>} />);
      
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should return true when titleRenderer and data are provided', () => {
      const data = { name: 'Test' };
      const titleRenderer = (d: typeof data) => <Typography>{d.name}</Typography>;
      
      render(
        <Card
          data={data}
          titleRenderer={titleRenderer}
          content={<Typography>Content</Typography>}
        />
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should return false when title is null and titleRenderer is not provided', () => {
      render(<Card title={null as any} content={<Typography>Content</Typography>} />);
      
      // Header should not be rendered
      const header = document.querySelector('.MuiBox-root[style*="borderBottom"]');
      expect(header).not.toBeInTheDocument();
    });

    it('should return false when titleRenderer is provided but data is null', () => {
      const titleRenderer = (d: any) => <Typography>{d?.name}</Typography>;
      
      render(
        <Card
          data={null}
          titleRenderer={titleRenderer}
          content={<Typography>Content</Typography>}
        />
      );
      
      // Header should not be rendered
      const header = document.querySelector('.MuiBox-root[style*="borderBottom"]');
      expect(header).not.toBeInTheDocument();
    });
  });
});

