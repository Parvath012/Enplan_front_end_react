// Mock for commonApp/WelcomePage
import React from 'react';

const WelcomePage: React.FC = () => {
  return (
    <div data-testid="container">
      <div data-testid="welcome-page">
        <img alt="Entity setup illustration" src="/mock-icons/welcome_image.png" />
        <div data-testid="typography">Welcome to Entity Setup</div>
        <div data-testid="typography">Set up your entities to get started</div>
        <button data-testid="button">Continue to Entity Setup</button>
      </div>
    </div>
  );
};

export default WelcomePage;
