import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../../src/components/layout/Footer';

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Management Mode', () => {
    it('should render user management statistics when all user props are provided', () => {
      render(
        <Footer
          totalUsers={100}
          activeUsers={80}
          inactiveUsers={20}
        />
      );

      expect(screen.getByText('Total Users: 100')).toBeInTheDocument();
      expect(screen.getByText('Active Users: 80')).toBeInTheDocument();
      expect(screen.getByText('Inactive Users: 20')).toBeInTheDocument();
    });

    it('should render with zero values', () => {
      render(
        <Footer
          totalUsers={0}
          activeUsers={0}
          inactiveUsers={0}
        />
      );

      expect(screen.getByText('Total Users: 0')).toBeInTheDocument();
      expect(screen.getByText('Active Users: 0')).toBeInTheDocument();
      expect(screen.getByText('Inactive Users: 0')).toBeInTheDocument();
    });

    it('should not render user management mode when some user props are missing', () => {
      render(
        <Footer
          totalUsers={100}
          activeUsers={80}
          // inactiveUsers is missing
        />
      );

      expect(screen.queryByText('Total Users: 100')).not.toBeInTheDocument();
      expect(screen.queryByText('Active Users: 80')).not.toBeInTheDocument();
    });

    it('should apply correct styling to user management content', () => {
      render(
        <Footer
          totalUsers={50}
          activeUsers={30}
          inactiveUsers={20}
          fontFamily="Arial"
          fontWeight={500}
          fontSize="14px"
          textColor="#333333"
        />
      );

      const totalUsersElement = screen.getByText('Total Users: 50');
      expect(totalUsersElement).toHaveStyle({
        fontFamily: 'Arial',
        fontWeight: 500,
        fontSize: '14px',
        color: '#333333',
        textAlign: 'left'
      });
    });

    it('should display statistics in a flex container with gap', () => {
      render(
        <Footer
          totalUsers={25}
          activeUsers={20}
          inactiveUsers={5}
        />
      );

      const container = screen.getByText('Total Users: 25').parentElement;
      expect(container).toHaveStyle({
        display: 'flex',
        gap: '24px' // 3 * 8px = 24px
      });
    });
  });

  describe('Entity Setup Mode', () => {
    it('should render entity setup content when count and label are provided', () => {
      render(
        <Footer
          count={42}
          label="Total Entities"
        />
      );

      expect(screen.getByText('Total Entities: 42')).toBeInTheDocument();
    });

    it('should render with zero count', () => {
      render(
        <Footer
          count={0}
          label="Items"
        />
      );

      expect(screen.getByText('Items: 0')).toBeInTheDocument();
    });

    it('should not render entity setup mode when count or label is missing', () => {
      render(
        <Footer
          count={42}
          // label is missing
        />
      );

      expect(screen.queryByText('Total Entities: 42')).not.toBeInTheDocument();
    });

    it('should apply correct styling to entity setup content', () => {
      render(
        <Footer
          count={15}
          label="Records"
          fontFamily="Helvetica"
          fontWeight={600}
          fontSize="16px"
          textColor="#666666"
        />
      );

      const element = screen.getByText('Records: 15');
      expect(element).toHaveStyle({
        fontFamily: 'Helvetica',
        fontWeight: 600,
        fontSize: '16px',
        color: '#666666',
        textAlign: 'left'
      });
    });
  });

  describe('No Content Mode', () => {
    it('should render nothing when no valid props are provided', () => {
      const { container } = render(<Footer />);
      
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('should render nothing when only partial user management props are provided', () => {
      const { container } = render(
        <Footer
          totalUsers={100}
          // activeUsers and inactiveUsers missing
        />
      );
      
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('should render nothing when only partial entity setup props are provided', () => {
      const { container } = render(
        <Footer
          count={42}
          // label missing
        />
      );
      
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe('Container Styling', () => {
    it('should apply default styling to container', () => {
      render(
        <Footer
          totalUsers={10}
          activeUsers={8}
          inactiveUsers={2}
        />
      );

      const container = screen.getByText('Total Users: 10').closest('div');
      // Check that the container exists and has the expected structure
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('MuiBox-root');
      
      // Check that the text content is rendered correctly
      expect(screen.getByText('Total Users: 10')).toBeInTheDocument();
      expect(screen.getByText('Active Users: 8')).toBeInTheDocument();
      expect(screen.getByText('Inactive Users: 2')).toBeInTheDocument();
    });

    it('should apply custom styling props', () => {
      render(
        <Footer
          count={5}
          label="Items"
          height="60px"
          backgroundColor="#f0f0f0"
          borderColor="#cccccc"
          textColor="#000000"
          fontSize="14px"
          fontWeight={600}
          fontFamily="Arial"
          paddingLeft={4}
          zIndex={20}
        />
      );

      const container = screen.getByText('Items: 5').closest('div');
      expect(container).toHaveStyle({
        height: '60px',
        backgroundColor: '#f0f0f0',
        borderColor: '#cccccc',
        color: '#000000',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'Arial',
        paddingLeft: '32px', // 4 * 8px
        zIndex: 20
      });
    });

    it('should apply border styling correctly', () => {
      render(
        <Footer
          count={1}
          label="Item"
        />
      );

      const container = screen.getByText('Item: 1').closest('div');
      // Check that the container exists and has the expected structure
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('MuiBox-root');
      
      // Check that the text content is rendered correctly
      expect(screen.getByText('Item: 1')).toBeInTheDocument();
    });
  });

  describe('Priority and Mode Detection', () => {
    it('should prioritize user management mode when both modes have valid props', () => {
      render(
        <Footer
          totalUsers={100}
          activeUsers={80}
          inactiveUsers={20}
          count={50}
          label="Entities"
        />
      );

      expect(screen.getByText('Total Users: 100')).toBeInTheDocument();
      expect(screen.queryByText('Entities: 50')).not.toBeInTheDocument();
    });

    it('should detect user management mode correctly with all three props', () => {
      const props = {
        totalUsers: 10,
        activeUsers: 8,
        inactiveUsers: 2
      };

      render(<Footer {...props} />);

      expect(screen.getByText('Total Users: 10')).toBeInTheDocument();
      expect(screen.getByText('Active Users: 8')).toBeInTheDocument();
      expect(screen.getByText('Inactive Users: 2')).toBeInTheDocument();
    });

    it('should detect entity setup mode correctly with count and label', () => {
      const props = {
        count: 25,
        label: 'Total Items'
      };

      render(<Footer {...props} />);

      expect(screen.getByText('Total Items: 25')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values gracefully', () => {
      render(
        <Footer
          totalUsers={undefined}
          activeUsers={undefined}
          inactiveUsers={undefined}
          count={undefined}
          label={undefined}
        />
      );

      const { container } = render(<Footer />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle null values gracefully', () => {
      render(
        <Footer
          totalUsers={null as any}
          activeUsers={null as any}
          inactiveUsers={null as any}
          count={null as any}
          label={null as any}
        />
      );

      const { container } = render(<Footer />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle empty string label', () => {
      render(
        <Footer
          count={10}
          label=""
        />
      );

      expect(screen.getByText(': 10')).toBeInTheDocument();
    });

    it('should handle negative numbers', () => {
      render(
        <Footer
          totalUsers={-5}
          activeUsers={-3}
          inactiveUsers={-2}
        />
      );

      expect(screen.getByText('Total Users: -5')).toBeInTheDocument();
      expect(screen.getByText('Active Users: -3')).toBeInTheDocument();
      expect(screen.getByText('Inactive Users: -2')).toBeInTheDocument();
    });
  });
});
