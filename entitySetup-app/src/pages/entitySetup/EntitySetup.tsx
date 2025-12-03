import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import EntityList from './EntityList';
import EntitySetupForm from './EntitySetupForm';
import EntityConfigurationLayout from '../../components/entityConfiguration/EntityConfigurationLayout';
import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntities, fetchEntityHierarchy } from '../../store/Reducers/entitySlice';
import type { RootState } from '../../store/configureStore';

// Module Federation imports
const CircularLoader = React.lazy(() => import('commonApp/CircularLoader'));

const EntitySetup: React.FC = () => {
  const [hasEntities, setHasEntities] = useState<boolean | null>(null);
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.entities.items);
  const globalLoading = useSelector((state: RootState) => state.entities.loading);
  const location = useLocation();
  const isIndexRoute = location.pathname === '/entitySetup' || location.pathname === '/entitySetup/' || location.pathname === '/' || location.pathname === '/admin/entity-setup' || location.pathname === '/admin/entity-setup/';

  // Check if entities exist when component mounts
  useEffect(() => {
    // @ts-ignore
    dispatch(fetchEntities());
    // @ts-ignore
    dispatch(fetchEntityHierarchy());
  }, []); // Empty dependency array - run only once
  
  useEffect(() => {
    // Only set hasEntities when loading is complete and we have a stable state
    if (!globalLoading) {
      // Add a small delay to ensure state is properly synchronized
      const timer = setTimeout(() => {
        console.log('Setting hasEntities:', items.length > 0, 'Items length:', items.length);
        setHasEntities(items.length > 0);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [globalLoading, items.length]); // Include globalLoading in dependencies

  console.log('Render state - globalLoading:', globalLoading, 'hasEntities:', hasEntities, 'items.length:', items.length);

  // Show loader only on index route when loading or when we haven't determined hasEntities yet
  if (isIndexRoute && (globalLoading || hasEntities === null)) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularLoader 
          variant="content"
          backgroundColor="#e0f2ff"
          activeColor="#007bff"
          speed={1}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Routes>
        <Route index element={hasEntities ? <EntityList /> : <WelcomePage />} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="list" element={<EntityList />} />
        <Route path="create" element={<EntitySetupForm />} />
        <Route path="edit/:id" element={<EntitySetupForm />} />
        <Route path="configure/:id" element={<EntityConfigurationLayout isViewMode={false} />} />
        <Route path="view/:id" element={<EntityConfigurationLayout isViewMode={true} />} />
        <Route path="*" element={hasEntities ? <EntityList /> : <WelcomePage />} />
      </Routes>
    </div>
  );
};

export default EntitySetup;
