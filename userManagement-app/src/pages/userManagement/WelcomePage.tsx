import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomePage from 'commonApp/WelcomePage';

const UserManagementWelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateUser = () => {
    // Detect if we're inside the admin app or standalone
    const isAdminApp = window.location.pathname.includes('/admin/user-management');
    if (isAdminApp) {
      navigate('/admin/user-management/roles/create');
    } else {
      navigate('/user-management/roles/create');
    }
  };

  return (
    <WelcomePage
      title="Welcome! Let's get started with User Management."
      subtitle="User Management setup is required. Please continue adding users to the system."
      buttonText="Continue to User Management Setup"
      buttonWidth="300px"
      onButtonClick={handleCreateUser}
      illustrationAlt="User management illustration"
    />
  );
};

export default UserManagementWelcomePage;
