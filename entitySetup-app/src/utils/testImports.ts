// Test-specific import utility that bypasses React.lazy() in test environment
// This file is ONLY used in test environment and has ZERO impact on production

// Mock components for testing - using React.createElement instead of JSX
import React from 'react';

const MockCustomTooltip = () => React.createElement('div', { 'data-testid': 'mock-custom-tooltip' }, 'Mock CustomTooltip');
const MockToggleSwitch = () => React.createElement('div', { 'data-testid': 'mock-toggle-switch' }, 'Mock ToggleSwitch');
const MockFormHeader = () => React.createElement('div', { 'data-testid': 'mock-form-header' }, 'Mock FormHeader');
const MockCircularLoader = () => React.createElement('div', { 'data-testid': 'mock-circular-loader' }, 'Mock CircularLoader');
const MockSearchField = () => React.createElement('div', { 'data-testid': 'mock-search-field' }, 'Mock SearchField');
const MockAgGridShell = () => React.createElement('div', { 'data-testid': 'mock-ag-grid-shell' }, 'Mock AgGridShell');
const MockListItem = () => React.createElement('div', { 'data-testid': 'mock-list-item' }, 'Mock ListItem');
const MockTextField = () => React.createElement('div', { 'data-testid': 'mock-text-field' }, 'Mock TextField');
const MockSelectField = () => React.createElement('div', { 'data-testid': 'mock-select-field' }, 'Mock SelectField');
const MockReadOnlyField = () => React.createElement('div', { 'data-testid': 'mock-read-only-field' }, 'Mock ReadOnlyField');
const MockCustomSlider = () => React.createElement('div', { 'data-testid': 'mock-custom-slider' }, 'Mock CustomSlider');
const MockFormSection = () => React.createElement('div', { 'data-testid': 'mock-form-section' }, 'Mock FormSection');
const MockMultiSelectField = () => React.createElement('div', { 'data-testid': 'mock-multi-select-field' }, 'Mock MultiSelectField');
const MockHeaderBar = () => React.createElement('div', { 'data-testid': 'mock-header-bar' }, 'Mock HeaderBar');
const MockNotificationAlert = () => React.createElement('div', { 'data-testid': 'mock-notification-alert' }, 'Mock NotificationAlert');
const MockFileUpload = () => React.createElement('div', { 'data-testid': 'mock-file-upload' }, 'Mock FileUpload');
const MockFormFooter = () => React.createElement('div', { 'data-testid': 'mock-form-footer' }, 'Mock FormFooter');
const MockCustomRadio = () => React.createElement('div', { 'data-testid': 'mock-custom-radio' }, 'Mock CustomRadio');

// Test-specific import function that returns mock components
export const testImport = (moduleName: string) => {
  const mockComponents: Record<string, React.ComponentType> = {
    'commonApp/CustomTooltip': MockCustomTooltip,
    'commonApp/ToggleSwitch': MockToggleSwitch,
    'commonApp/FormHeader': MockFormHeader,
    'commonApp/CircularLoader': MockCircularLoader,
    'commonApp/SearchField': MockSearchField,
    'commonApp/AgGridShell': MockAgGridShell,
    'commonApp/ListItem': MockListItem,
    'commonApp/TextField': MockTextField,
    'commonApp/SelectField': MockSelectField,
    'commonApp/ReadOnlyField': MockReadOnlyField,
    'commonApp/CustomSlider': MockCustomSlider,
    'commonApp/FormSection': MockFormSection,
    'commonApp/MultiSelectField': MockMultiSelectField,
    'commonApp/HeaderBar': MockHeaderBar,
    'commonApp/NotificationAlert': MockNotificationAlert,
    'commonApp/FileUpload': MockFileUpload,
    'commonApp/FormFooter': MockFormFooter,
    'commonApp/CustomRadio': MockCustomRadio,
  };

  return mockComponents[moduleName] || (() => React.createElement('div', { 'data-testid': 'mock-unknown' }, 'Mock Unknown'));
};

// Test-specific React.lazy replacement
export const testLazy = (importFn: () => Promise<{ default: React.ComponentType }>) => {
  // In test environment, return a component that renders the test wrapper
  return () => React.createElement('div', { 'data-testid': 'test-lazy-wrapper' }, 'Test Lazy Component');
};
