import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Layout from '../../src/pages/layout';

// Mock the external components and services
jest.mock('../../src/components/HorizontalNavBar', () => {
  return function MockHorizontalNavBar() {
    return <div data-testid="horizontal-nav-bar">HorizontalNavBar</div>;
  };
});

jest.mock('../../src/components/TabNavigation', () => {
  return function MockTabNavigation({ onTabChange }: { onTabChange: (index: number) => void }) {
    return (
      <div data-testid="tab-navigation">
        <button onClick={() => onTabChange(4)} data-testid="process-group-tab">
          Process Group
        </button>
      </div>
    );
  };
});

jest.mock('../../src/components/Grid', () => {
  return function MockGridBoard() {
    return <div data-testid="grid-board">GridBoard</div>;
  };
});

jest.mock('../../src/components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock('../../src/pages/ControllerServices', () => {
  return function MockControllerServices() {
    return <div data-testid="controller-services">ControllerServices</div>;
  };
});

jest.mock('../../src/api/nifi/nifiApiService', () => ({
  nifiApiService: {
    authenticate: jest.fn().mockResolvedValue(undefined),
    getFlowStatus: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('commonApp/CircularLoader', () => {
  return function MockCircularLoader() {
    return <div data-testid="circular-loader">Loading...</div>;
  };
});

// CustomSlider is local to dataManagement-app, no need to mock commonApp/RightSlider
jest.mock('../../src/components/CustomSlider', () => {
  return function MockCustomSlider({ 
    open, 
    onClose, 
    title, 
    children 
  }: { 
    open: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode; 
  }) {
    return open ? (
      <div data-testid="right-slider">
        <div data-testid="slider-title">{title}</div>
        <button onClick={onClose} data-testid="close-slider">Close</button>
        {children}
      </div>
    ) : null;
  };
});

// Create a mock store with nifi reducer
const mockStore = configureStore({
  reducer: {
    auth: (state = { token: null }, action) => {
      switch (action.type) {
        case 'auth/setToken':
          return { ...state, token: action.payload };
        default:
          return state;
      }
    },
    nifi: (state = { 
      status: null, 
      loading: false, 
      error: null, 
      lastUpdated: null, 
      isPollingActive: false,
      processGroups: [],
      creatingProcessGroup: false,
      fetchingProcessGroups: false
    }, action) => {
      return state;
    },
  },
});

describe('Layout - Process Group Tab Slider', () => {
  it('opens right slider when Process Group tab is clicked', async () => {
    render(
      <Provider store={mockStore}>
        <Layout />
      </Provider>
    );

    // Wait for loading to complete
    await screen.findByTestId('tab-navigation');

    // Initially, slider should not be visible
    expect(screen.queryByTestId('right-slider')).not.toBeInTheDocument();

    // Click the Process Group tab
    const processGroupTab = screen.getByTestId('process-group-tab');
    fireEvent.click(processGroupTab);

    // Slider should now be visible
    expect(screen.getByTestId('right-slider')).toBeInTheDocument();
    expect(screen.getByTestId('slider-title')).toHaveTextContent('Create Process Group');
  });

  it('closes slider when close button is clicked', async () => {
    render(
      <Provider store={mockStore}>
        <Layout />
      </Provider>
    );

    // Wait for loading to complete
    await screen.findByTestId('tab-navigation');

    // Click the Process Group tab to open slider
    const processGroupTab = screen.getByTestId('process-group-tab');
    fireEvent.click(processGroupTab);

    // Slider should be visible
    expect(screen.getByTestId('right-slider')).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByTestId('close-slider');
    fireEvent.click(closeButton);

    // Slider should be closed
    expect(screen.queryByTestId('right-slider')).not.toBeInTheDocument();
  });
});