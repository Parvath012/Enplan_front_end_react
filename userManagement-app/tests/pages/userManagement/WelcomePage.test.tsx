import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserManagementWelcomePage from '../../../src/pages/userManagement/WelcomePage';

// Mock the commonApp WelcomePage component
jest.mock('commonApp/WelcomePage', () => {
  return jest.fn(({ title, subtitle, buttonText, buttonWidth, onButtonClick, illustrationAlt }) => (
    <div data-testid="welcome-page">
      <h1 data-testid="welcome-title">{title}</h1>
      <p data-testid="welcome-subtitle">{subtitle}</p>
      <button 
        data-testid="welcome-button" 
        onClick={onButtonClick}
        style={{ width: buttonWidth }}
      >
        {buttonText}
      </button>
      <div data-testid="welcome-illustration" aria-label={illustrationAlt}>
        Illustration
      </div>
    </div>
  ));
});

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock window.location
const mockLocation = {
  pathname: '/user-management',
  href: 'http://localhost:3000/user-management',
  origin: 'http://localhost:3000'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('UserManagementWelcomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.location for each test
    Object.defineProperty(window, 'location', {
      value: { ...mockLocation },
      writable: true
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
    });

    it('should display correct title', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      expect(screen.getByTestId('welcome-title')).toHaveTextContent("Welcome! Let's get started with User Management.");
    });

    it('should display correct subtitle', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      expect(screen.getByTestId('welcome-subtitle')).toHaveTextContent('User Management setup is required. Please continue adding users to the system.');
    });

    it('should display correct button text', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      expect(screen.getByTestId('welcome-button')).toHaveTextContent('Continue to User Management Setup');
    });

    it('should display correct button width', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      expect(button).toHaveStyle('width: 300px');
    });

    it('should display correct illustration alt text', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      expect(screen.getByTestId('welcome-illustration')).toHaveAttribute('aria-label', 'User management illustration');
    });
  });

  describe('Navigation Logic', () => {
    it('should navigate to /create when not in admin app', () => {
      // Mock non-admin path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/user-management' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('should navigate to /admin/user-management/create when in admin app', () => {
      // Mock admin app path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/create');
    });

    it('should navigate to /admin/user-management/create when path includes /admin/user-management', () => {
      // Mock admin app path with additional segments
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management/welcome' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/create');
    });

    it('should navigate to /create when path does not include /admin/user-management', () => {
      // Mock non-admin path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/user-management/welcome' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('should handle root path', () => {
      // Mock root path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('should handle empty path', () => {
      // Mock empty path
      Object.defineProperty(window, 'location', {
        value: { pathname: '' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });
  });

  describe('Path Detection Edge Cases', () => {
    it('should handle path with query parameters', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management?tab=1' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/create');
    });

    it('should handle path with hash', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management#section1' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/create');
    });

    it('should handle case sensitivity in path detection', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/ADMIN/USER-MANAGEMENT' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      // Should not match due to case sensitivity
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('should handle partial matches correctly', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management-other' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      // The component uses .includes() which will match partial paths
      // So '/admin/user-management-other' will match and navigate to admin path
      expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/create');
    });

    it('should handle path with trailing slash', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/user-management/' },
        writable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management/create');
    });
  });

  describe('Component Props', () => {
    it('should pass correct props to WelcomePage component', () => {
      const WelcomePage = require('commonApp/WelcomePage');
      renderWithRouter(<UserManagementWelcomePage />);

      // React functional components receive props as first argument
      // Verify the component was called with the correct props
      expect(WelcomePage).toHaveBeenCalled();
      const callArgs = WelcomePage.mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        title: "Welcome! Let's get started with User Management.",
        subtitle: 'User Management setup is required. Please continue adding users to the system.',
        buttonText: 'Continue to User Management Setup',
        buttonWidth: '300px',
        onButtonClick: expect.any(Function),
        illustrationAlt: 'User management illustration'
      });
    });

    it('should handle button click with correct navigation logic', () => {
      const WelcomePage = require('commonApp/WelcomePage');
      renderWithRouter(<UserManagementWelcomePage />);

      const welcomePageProps = WelcomePage.mock.calls[0][0];
      welcomePageProps.onButtonClick();

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmounting', () => {
      const { unmount } = renderWithRouter(<UserManagementWelcomePage />);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
      unmount();
    });

    it('should handle multiple button clicks', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });
  });

  describe('Error Handling', () => {
    it('should call navigate function', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      fireEvent.click(button);
      
      // Verify navigate was called
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle unusual pathname values', () => {
      // Mock location with a pathname that doesn't match admin pattern
      Object.defineProperty(window, 'location', {
        value: { pathname: '/some/other/path' },
        writable: true,
        configurable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      // Component should render
      expect(button).toBeInTheDocument();
      
      // When pathname doesn't include '/admin/user-management', navigate to '/create'
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('should handle empty pathname', () => {
      // Mock location with empty pathname
      Object.defineProperty(window, 'location', {
        value: { pathname: '' },
        writable: true,
        configurable: true
      });

      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      // Component should render
      expect(button).toBeInTheDocument();
      
      // When clicked, empty pathname should not match admin path
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Continue to User Management Setup');
    });

    it('should have proper illustration accessibility', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      const illustration = screen.getByTestId('welcome-illustration');
      
      expect(illustration).toHaveAttribute('aria-label', 'User management illustration');
    });

    it('should have proper heading structure', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      const title = screen.getByTestId('welcome-title');
      const subtitle = screen.getByTestId('welcome-subtitle');
      
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should work with different router contexts', () => {
      const { rerender } = renderWithRouter(<UserManagementWelcomePage />);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();

      rerender(<UserManagementWelcomePage />);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
    });

    it('should handle rapid navigation calls', () => {
      renderWithRouter(<UserManagementWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(mockNavigate).toHaveBeenCalledTimes(10);
    });
  });
});
