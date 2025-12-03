import React from 'react';
import { render, screen } from '@testing-library/react';
import { testImport, testLazy } from '../../src/utils/testImports';

describe('testImports', () => {
  describe('testImport function', () => {
    it('returns correct mock component for known modules', () => {
      const CustomTooltip = testImport('commonApp/CustomTooltip');
      const ToggleSwitch = testImport('commonApp/ToggleSwitch');
      const FormHeader = testImport('commonApp/FormHeader');
      const CircularLoader = testImport('commonApp/CircularLoader');
      const SearchField = testImport('commonApp/SearchField');
      const AgGridShell = testImport('commonApp/AgGridShell');
      const ListItem = testImport('commonApp/ListItem');
      const TextField = testImport('commonApp/TextField');
      const SelectField = testImport('commonApp/SelectField');
      const ReadOnlyField = testImport('commonApp/ReadOnlyField');
      const CustomSlider = testImport('commonApp/CustomSlider');
      const FormSection = testImport('commonApp/FormSection');
      const MultiSelectField = testImport('commonApp/MultiSelectField');
      const HeaderBar = testImport('commonApp/HeaderBar');
      const NotificationAlert = testImport('commonApp/NotificationAlert');
      const FileUpload = testImport('commonApp/FileUpload');
      const FormFooter = testImport('commonApp/FormFooter');
      const CustomRadio = testImport('commonApp/CustomRadio');

      // Test CustomTooltip
      render(React.createElement(CustomTooltip));
      expect(screen.getByTestId('mock-custom-tooltip')).toBeInTheDocument();
      expect(screen.getByText('Mock CustomTooltip')).toBeInTheDocument();

      // Test ToggleSwitch
      render(React.createElement(ToggleSwitch));
      expect(screen.getByTestId('mock-toggle-switch')).toBeInTheDocument();
      expect(screen.getByText('Mock ToggleSwitch')).toBeInTheDocument();

      // Test FormHeader
      render(React.createElement(FormHeader));
      expect(screen.getByTestId('mock-form-header')).toBeInTheDocument();
      expect(screen.getByText('Mock FormHeader')).toBeInTheDocument();

      // Test CircularLoader
      render(React.createElement(CircularLoader));
      expect(screen.getByTestId('mock-circular-loader')).toBeInTheDocument();
      expect(screen.getByText('Mock CircularLoader')).toBeInTheDocument();

      // Test SearchField
      render(React.createElement(SearchField));
      expect(screen.getByTestId('mock-search-field')).toBeInTheDocument();
      expect(screen.getByText('Mock SearchField')).toBeInTheDocument();

      // Test AgGridShell
      render(React.createElement(AgGridShell));
      expect(screen.getByTestId('mock-ag-grid-shell')).toBeInTheDocument();
      expect(screen.getByText('Mock AgGridShell')).toBeInTheDocument();

      // Test ListItem
      render(React.createElement(ListItem));
      expect(screen.getByTestId('mock-list-item')).toBeInTheDocument();
      expect(screen.getByText('Mock ListItem')).toBeInTheDocument();

      // Test TextField
      render(React.createElement(TextField));
      expect(screen.getByTestId('mock-text-field')).toBeInTheDocument();
      expect(screen.getByText('Mock TextField')).toBeInTheDocument();

      // Test SelectField
      render(React.createElement(SelectField));
      expect(screen.getByTestId('mock-select-field')).toBeInTheDocument();
      expect(screen.getByText('Mock SelectField')).toBeInTheDocument();

      // Test ReadOnlyField
      render(React.createElement(ReadOnlyField));
      expect(screen.getByTestId('mock-read-only-field')).toBeInTheDocument();
      expect(screen.getByText('Mock ReadOnlyField')).toBeInTheDocument();

      // Test CustomSlider
      render(React.createElement(CustomSlider));
      expect(screen.getByTestId('mock-custom-slider')).toBeInTheDocument();
      expect(screen.getByText('Mock CustomSlider')).toBeInTheDocument();

      // Test FormSection
      render(React.createElement(FormSection));
      expect(screen.getByTestId('mock-form-section')).toBeInTheDocument();
      expect(screen.getByText('Mock FormSection')).toBeInTheDocument();

      // Test MultiSelectField
      render(React.createElement(MultiSelectField));
      expect(screen.getByTestId('mock-multi-select-field')).toBeInTheDocument();
      expect(screen.getByText('Mock MultiSelectField')).toBeInTheDocument();

      // Test HeaderBar
      render(React.createElement(HeaderBar));
      expect(screen.getByTestId('mock-header-bar')).toBeInTheDocument();
      expect(screen.getByText('Mock HeaderBar')).toBeInTheDocument();

      // Test NotificationAlert
      render(React.createElement(NotificationAlert));
      expect(screen.getByTestId('mock-notification-alert')).toBeInTheDocument();
      expect(screen.getByText('Mock NotificationAlert')).toBeInTheDocument();

      // Test FileUpload
      render(React.createElement(FileUpload));
      expect(screen.getByTestId('mock-file-upload')).toBeInTheDocument();
      expect(screen.getByText('Mock FileUpload')).toBeInTheDocument();

      // Test FormFooter
      render(React.createElement(FormFooter));
      expect(screen.getByTestId('mock-form-footer')).toBeInTheDocument();
      expect(screen.getByText('Mock FormFooter')).toBeInTheDocument();

      // Test CustomRadio
      render(React.createElement(CustomRadio));
      expect(screen.getByTestId('mock-custom-radio')).toBeInTheDocument();
      expect(screen.getByText('Mock CustomRadio')).toBeInTheDocument();
    });

    it('returns unknown mock component for unknown modules', () => {
      const UnknownComponent = testImport('unknown/module');
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
      expect(screen.getByText('Mock Unknown')).toBeInTheDocument();
    });

    it('returns unknown mock component for empty string', () => {
      const UnknownComponent = testImport('');
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
      expect(screen.getByText('Mock Unknown')).toBeInTheDocument();
    });

    it('returns unknown mock component for undefined', () => {
      const UnknownComponent = testImport(undefined as any);
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
      expect(screen.getByText('Mock Unknown')).toBeInTheDocument();
    });

    it('returns unknown mock component for null', () => {
      const UnknownComponent = testImport(null as any);
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
      expect(screen.getByText('Mock Unknown')).toBeInTheDocument();
    });

    it('handles case-sensitive module names', () => {
      const UnknownComponent = testImport('commonApp/customtooltip'); // lowercase
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
      expect(screen.getByText('Mock Unknown')).toBeInTheDocument();
    });

    it('handles partial module names', () => {
      const UnknownComponent = testImport('commonApp/Custom'); // partial name
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
      expect(screen.getByText('Mock Unknown')).toBeInTheDocument();
    });

    it('handles modules with extra paths', () => {
      const UnknownComponent = testImport('commonApp/CustomTooltip/extra/path');
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
      expect(screen.getByText('Mock Unknown')).toBeInTheDocument();
    });
  });

  describe('testLazy function', () => {
    it('returns test lazy wrapper component', () => {
      const mockImportFn = jest.fn(() => Promise.resolve({ default: () => React.createElement('div') }));
      const LazyComponent = testLazy(mockImportFn);
      
      render(React.createElement(LazyComponent));
      expect(screen.getByTestId('test-lazy-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Test Lazy Component')).toBeInTheDocument();
    });

    it('handles different import functions', () => {
      const mockImportFn1 = jest.fn(() => Promise.resolve({ default: () => React.createElement('div', {}, 'Component 1') }));
      const mockImportFn2 = jest.fn(() => Promise.resolve({ default: () => React.createElement('div', {}, 'Component 2') }));
      
      const LazyComponent1 = testLazy(mockImportFn1);
      const LazyComponent2 = testLazy(mockImportFn2);
      
      // Test first component
      const { unmount } = render(React.createElement(LazyComponent1));
      expect(screen.getByTestId('test-lazy-wrapper')).toBeInTheDocument();
      unmount();
      
      // Test second component
      render(React.createElement(LazyComponent2));
      expect(screen.getByTestId('test-lazy-wrapper')).toBeInTheDocument();
    });

    it('handles async import functions', async () => {
      const asyncImportFn = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { default: () => React.createElement('div', {}, 'Async Component') };
      });
      
      const LazyComponent = testLazy(asyncImportFn);
      
      render(React.createElement(LazyComponent));
      expect(screen.getByTestId('test-lazy-wrapper')).toBeInTheDocument();
    });

    it('handles import functions that throw errors', () => {
      const errorImportFn = jest.fn(() => {
        throw new Error('Import failed');
      });
      
      const LazyComponent = testLazy(errorImportFn);
      
      render(React.createElement(LazyComponent));
      expect(screen.getByTestId('test-lazy-wrapper')).toBeInTheDocument();
    });

    it('handles import functions that return null', () => {
      const nullImportFn = jest.fn(() => Promise.resolve(null as any));
      
      const LazyComponent = testLazy(nullImportFn);
      
      render(React.createElement(LazyComponent));
      expect(screen.getByTestId('test-lazy-wrapper')).toBeInTheDocument();
    });

    it('handles import functions that return undefined', () => {
      const undefinedImportFn = jest.fn(() => Promise.resolve(undefined as any));
      
      const LazyComponent = testLazy(undefinedImportFn);
      
      render(React.createElement(LazyComponent));
      expect(screen.getByTestId('test-lazy-wrapper')).toBeInTheDocument();
    });
  });

  describe('Integration tests', () => {
    it('works with multiple components in same render', () => {
      const CustomTooltip = testImport('commonApp/CustomTooltip');
      const ToggleSwitch = testImport('commonApp/ToggleSwitch');
      const FormHeader = testImport('commonApp/FormHeader');
      
      render(
        React.createElement('div', null,
          React.createElement(CustomTooltip),
          React.createElement(ToggleSwitch),
          React.createElement(FormHeader)
        )
      );
      
      expect(screen.getByTestId('mock-custom-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('mock-toggle-switch')).toBeInTheDocument();
      expect(screen.getByTestId('mock-form-header')).toBeInTheDocument();
    });

    it('works with testLazy and testImport together', () => {
      const CustomTooltip = testImport('commonApp/CustomTooltip');
      const mockImportFn = jest.fn(() => Promise.resolve({ default: () => React.createElement('div') }));
      const LazyComponent = testLazy(mockImportFn);
      
      render(
        React.createElement('div', null,
          React.createElement(CustomTooltip),
          React.createElement(LazyComponent)
        )
      );
      
      expect(screen.getByTestId('mock-custom-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('test-lazy-wrapper')).toBeInTheDocument();
    });

    it('handles rapid successive calls', () => {
      const components = [];
      for (let i = 0; i < 10; i++) {
        components.push(testImport('commonApp/CustomTooltip'));
      }
      
      render(
        React.createElement('div', null,
          ...components.map((Component, index) => 
            React.createElement(Component, { key: index })
          )
        )
      );
      
      const tooltips = screen.getAllByTestId('mock-custom-tooltip');
      expect(tooltips).toHaveLength(10);
    });
  });

  describe('Edge cases', () => {
    it('handles very long module names', () => {
      const longModuleName = 'commonApp/' + 'a'.repeat(1000);
      const UnknownComponent = testImport(longModuleName);
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
    });

    it('handles special characters in module names', () => {
      const specialModuleName = 'commonApp/Component@#$%^&*()';
      const UnknownComponent = testImport(specialModuleName);
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
    });

    it('handles unicode characters in module names', () => {
      const unicodeModuleName = 'commonApp/Component🚀🎉';
      const UnknownComponent = testImport(unicodeModuleName);
      
      render(React.createElement(UnknownComponent));
      expect(screen.getByTestId('mock-unknown')).toBeInTheDocument();
    });
  });
});
