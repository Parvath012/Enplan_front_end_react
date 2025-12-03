import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import UserList from './UserList';
import UserCreateForm from './UserCreateForm';
import UserEditForm from './UserEditForm';
import RoleForm from './RoleForm';
import GroupCreateForm from './GroupCreateForm';
import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/Reducers/userSlice';
import { fetchRoles } from '../../store/Reducers/roleSlice';
import { fetchGroups } from '../../store/Reducers/groupSlice';
import type { RootState } from '../../store/configureStore';

// Import directly from common-app
import CircularLoader from 'commonApp/CircularLoader';

const UserManagement: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasUsers, loading, users, initialFetchAttempted } = useSelector((state: RootState) => state.users);
  const { hasRoles, loading: rolesLoading, initialFetchAttempted: rolesInitialFetchAttempted } = useSelector((state: RootState) => state.roles);
  const { initialFetchAttempted: groupsInitialFetchAttempted, loading: groupsLoading } = useSelector((state: RootState) => state.groups);
  const location = useLocation();
  const isIndexRoute = location.pathname === '/user-management' || location.pathname === '/user-management/' || location.pathname === '/' || location.pathname === '/admin/user-management' || location.pathname === '/admin/user-management/';
  
  // Track if we've already navigated to prevent multiple navigations
  const hasNavigatedRef = useRef(false);

  // Helper function to get base path
  const getBasePath = (): string => {
    const isAdminApp = location.pathname.includes('/admin');
    return isAdminApp ? '/admin/user-management' : '/user-management';
  };

  // Helper function to handle navigation based on users and roles
  const handleNavigation = (basePath: string): void => {
    if (!hasUsers && !hasRoles) {
      // No users and no roles → navigate to welcome page
      hasNavigatedRef.current = true;
      navigate(`${basePath}/welcome`, { replace: true });
    } else if (!hasUsers && hasRoles) {
      // Existing roles but zero users → navigate to roles list
      hasNavigatedRef.current = true;
      navigate(`${basePath}/roles`, { replace: true });
    } else {
      // Has users → stay on index route (shows users list)
      hasNavigatedRef.current = true;
    }
  };

  // Fetch users when component mounts, but only if we haven't attempted the initial fetch yet
  useEffect(() => {
    if (!initialFetchAttempted && !loading) {
      // @ts-ignore
      dispatch(fetchUsers());
    }
  }, [dispatch, initialFetchAttempted, loading]);

  // Fetch roles when component mounts, but only if we haven't attempted the initial fetch yet
  useEffect(() => {
    if (!rolesInitialFetchAttempted) {
      // @ts-ignore
      dispatch(fetchRoles());
    }
  }, [dispatch, rolesInitialFetchAttempted]);

  // Navigation logic: Navigate based on users and roles state when on index route
  useEffect(() => {
    // Only navigate on index route and if we haven't navigated yet
    if (!isIndexRoute || hasNavigatedRef.current) {
      return;
    }

    // Wait for both users and roles to be fetched
    const bothFetchesComplete = initialFetchAttempted && rolesInitialFetchAttempted;
    const bothNotLoading = !loading && !rolesLoading;

    if (bothFetchesComplete && bothNotLoading) {
      handleNavigation(getBasePath());
    }
  }, [
    isIndexRoute,
    initialFetchAttempted,
    rolesInitialFetchAttempted,
    loading,
    rolesLoading,
    hasUsers,
    hasRoles,
    navigate,
    location.pathname
  ]);

  // Reset navigation flag when route changes (not index route)
  useEffect(() => {
    if (!isIndexRoute) {
      hasNavigatedRef.current = false;
    }
  }, [isIndexRoute]);

  // Fetch groups when component mounts, but only if we haven't attempted the initial fetch yet
  // Note: Groups will use available users from state to populate member names
  useEffect(() => {
    if (!groupsInitialFetchAttempted && !groupsLoading) {
      // @ts-ignore
      dispatch(fetchGroups());
    }
  }, [dispatch, groupsInitialFetchAttempted, groupsLoading]);

  // Debug logging
  console.log('Render state - loading:', loading, 'hasUsers:', hasUsers, 'users.length:', users.length, 'initialFetchAttempted:', initialFetchAttempted);

  // Check fetch completion status
  const bothFetchesComplete = initialFetchAttempted && rolesInitialFetchAttempted;
  const bothNotLoading = !loading && !rolesLoading;
  
  // On index route, we need to wait for both fetches to complete before deciding what to show
  // This prevents flashing UserList before we know if we should show welcome page
  const shouldWaitForFetches = isIndexRoute && (!bothFetchesComplete || !bothNotLoading);
  
  // Show loader on index route when we're still waiting for fetches to complete
  // Don't show loader on subsequent refreshes (e.g., after transfer responsibilities)
  // This prevents the loader from appearing in the middle of the screen after operations like transfer
  // Show loader if: on index route AND (still loading OR fetches not complete) AND we don't have users yet (initial load scenario)
  // After initial load, if we have users and loading is true (refresh), don't show full-screen loader
  const isInitialLoad = shouldWaitForFetches && !hasUsers;
  if (isInitialLoad) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#e0f2ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <CircularLoader 
          variant="content"
          backgroundColor="#e0f2ff"
          activeColor="#007bff"
          speed={1}
        />
      </div>
    );
  }

  // Check if we should show welcome page directly (before rendering routes to prevent flash)
  // This happens when: on index route, both fetches complete, and no users/roles
  const shouldShowWelcomeDirectly = isIndexRoute && bothFetchesComplete && bothNotLoading && !hasUsers && !hasRoles;

  // Check if we should navigate to roles list directly (before rendering routes to prevent flash)
  // This happens when: on index route, both fetches complete, roles exist but no users
  const shouldNavigateToRolesList = isIndexRoute && bothFetchesComplete && bothNotLoading && !hasUsers && hasRoles;

  // If we should show welcome page directly, render it immediately (prevents flash of UserList)
  // Navigation is handled in useEffect above
  if (shouldShowWelcomeDirectly) {
    return <WelcomePage />;
  }

  // If we should navigate to roles list, return null to prevent rendering UserList before navigation completes
  // Navigation is handled in useEffect above
  if (shouldNavigateToRolesList) {
    return null;
  }

  // Determine what to show on index route
  // Always show UserList on index route - navigation logic handles routing to appropriate page
  const getIndexElement = () => {
    return <UserList />;
  };

  // Determine what to show for catch-all route (404 or unmatched paths)
  // Always show UserList - navigation logic handles routing to appropriate page
  const getCatchAllElement = () => {
    return <UserList />;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Routes>
        <Route index element={getIndexElement()} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="list" element={<UserList />} />
        <Route path="create" element={<UserCreateForm />} />
        <Route path="edit/:id" element={<UserEditForm />} />
        <Route path="roles" element={<UserList />} />
        <Route path="roles/create" element={<RoleForm />} />
        <Route path="roles/edit/:id" element={<RoleForm />} />
        <Route path="groups" element={<UserList />} />
        <Route path="groups/create" element={<GroupCreateForm />} />
        <Route path="groups/edit/:id" element={<GroupCreateForm />} />
        <Route path="structure" element={<UserList />} />
        <Route path="*" element={getCatchAllElement()} />
      </Routes>
    </div>
  );
};

export default UserManagement;
