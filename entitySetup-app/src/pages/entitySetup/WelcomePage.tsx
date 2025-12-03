import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomePage from 'commonApp/WelcomePage';

const EntitySetupWelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateEntity = () => {
    // Detect if we're inside the admin app or standalone
    const isAdminApp = window.location.pathname.includes('/admin/entity-setup');
    if (isAdminApp) {
      navigate('/admin/entity-setup/create');
    } else {
      navigate('/create');
    }
  };

  return (
    <WelcomePage
      title="Welcome! Let's get started with your Entity Setup."
      subtitle="Entity Setup is required to proceed. Please begin configuration."
      buttonText="Continue to Entity Setup"
      buttonWidth="219px"
      onButtonClick={handleCreateEntity}
      illustrationAlt="Entity setup illustration"
    />
  );
};

export default EntitySetupWelcomePage;
