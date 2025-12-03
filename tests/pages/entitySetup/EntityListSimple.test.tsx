import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import EntityList from '../../../src/pages/entitySetup/EntityList';

const mockStore = configureStore([]);
const initialState = {
  entities: {
    items: [
      { id: '1', legalBusinessName: 'Entity 1', displayName: 'E1', entityType: 'Type A', address: '123 Main St', structure: 'S1', isConfigured: true },
    ],
    isLoading: false,
    error: null,
  },
  entityConfiguration: {},
  periodSetup: {},
  modules: {},
};

describe('EntityListSimple', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <Provider store={store}>
        <Router>
          <EntityList />
        </Router>
      </Provider>
    );
    expect(screen.getByTestId('entity-list-page')).toBeInTheDocument();
  });
});





