import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EntitySetupWelcomePage from '../../../src/pages/entitySetup/WelcomePage';

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
  pathname: '/entity-setup',
  href: 'http://localhost:3000/entity-setup',
  origin: 'http://localhost:3000'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('EntitySetupWelcomePage', () => {
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
      renderWithRouter(<EntitySetupWelcomePage />);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
    });

    it('should display correct title', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      expect(screen.getByTestId('welcome-title')).toHaveTextContent("Welcome! Let's get started with your Entity Setup.");
    });

    it('should display correct subtitle', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      expect(screen.getByTestId('welcome-subtitle')).toHaveTextContent('Entity Setup is required to proceed. Please begin configuration.');
    });

    it('should display correct button text', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      expect(screen.getByTestId('welcome-button')).toHaveTextContent('Continue to Entity Setup');
    });

    it('should display correct button width', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      expect(button).toHaveStyle('width: 219px');
    });

    it('should display correct illustration alt text', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      expect(screen.getByTestId('welcome-illustration')).toHaveAttribute('aria-label', 'Entity setup illustration');
    });
  });

  describe('Navigation Logic', () => {
    it('should navigate to /create when not in admin app', () => {
      // Mock non-admin path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/entity-setup' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('should navigate to /admin/entity-setup/create when in admin app', () => {
      // Mock admin app path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/entity-setup' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/entity-setup/create');
    });

    it('should navigate to /admin/entity-setup/create when path includes /admin/entity-setup', () => {
      // Mock admin app path with additional segments
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/entity-setup/welcome' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/entity-setup/create');
    });

    it('should navigate to /create when path does not include /admin/entity-setup', () => {
      // Mock non-admin path
      Object.defineProperty(window, 'location', {
        value: { pathname: '/entity-setup/welcome' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
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

      renderWithRouter(<EntitySetupWelcomePage />);
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

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });
  });

  describe('Path Detection Edge Cases', () => {
    it('should handle path with query parameters', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/entity-setup?tab=1' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/entity-setup/create');
    });

    it('should handle path with hash', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/entity-setup#section1' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/entity-setup/create');
    });

    it('should handle case sensitivity in path detection', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/ADMIN/ENTITY-SETUP' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      // Should not match due to case sensitivity
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('should handle partial matches correctly', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/entity-setup-other' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      // Should not match due to partial match
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    it('should handle path with trailing slash', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/entity-setup/' },
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/entity-setup/create');
    });
  });

  describe('Component Props', () => {
    it('should pass correct props to WelcomePage component', () => {
      const WelcomePage = require('commonApp/WelcomePage');
      renderWithRouter(<EntitySetupWelcomePage />);

      expect(WelcomePage).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Welcome! Let's get started with your Entity Setup.",
          subtitle: 'Entity Setup is required to proceed. Please begin configuration.',
          buttonText: 'Continue to Entity Setup',
          buttonWidth: '219px',
          onButtonClick: expect.any(Function),
          illustrationAlt: 'Entity setup illustration'
        }),
        expect.any(Object)
      );
    });

    it('should handle button click with correct navigation logic', () => {
      const WelcomePage = require('commonApp/WelcomePage');
      renderWithRouter(<EntitySetupWelcomePage />);

      const welcomePageProps = WelcomePage.mock.calls[0][0];
      welcomePageProps.onButtonClick();

      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmounting', () => {
      const { unmount } = renderWithRouter(<EntitySetupWelcomePage />);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
      unmount();
    });

    it('should handle multiple button clicks', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });
  });

  describe('Error Handling', () => {
    it('should handle navigate function errors gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      expect(() => fireEvent.click(button)).toThrow('Navigation error');
    });

    it('should handle missing window.location', () => {
      // Mock missing location
      Object.defineProperty(window, 'location', {
        value: undefined,
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      expect(() => fireEvent.click(button)).toThrow();
    });

    it('should handle missing pathname', () => {
      // Mock missing pathname
      Object.defineProperty(window, 'location', {
        value: {},
        writable: true
      });

      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      expect(() => fireEvent.click(button)).toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Continue to Entity Setup');
    });

    it('should have proper illustration accessibility', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      const illustration = screen.getByTestId('welcome-illustration');
      
      expect(illustration).toHaveAttribute('aria-label', 'Entity setup illustration');
    });

    it('should have proper heading structure', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      const title = screen.getByTestId('welcome-title');
      const subtitle = screen.getByTestId('welcome-subtitle');
      
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should work with different router contexts', () => {
      const { rerender } = renderWithRouter(<EntitySetupWelcomePage />);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();

      rerender(<EntitySetupWelcomePage />);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
    });

    it('should handle rapid navigation calls', () => {
      renderWithRouter(<EntitySetupWelcomePage />);
      const button = screen.getByTestId('welcome-button');
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(mockNavigate).toHaveBeenCalledTimes(10);
    });
  });
});
