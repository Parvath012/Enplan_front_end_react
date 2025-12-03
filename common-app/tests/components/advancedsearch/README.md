# Advanced Search Components Test Suite

This directory contains comprehensive test cases for all advanced search components in the `src/components/advancedsearch/` directory.

## Test Files

### Core Components
- **`AdvancedSearchComponent.test.tsx`** - Main search component with multiple search modes (Data, Columns, Rows)
- **`QueryAutoComplete.test.tsx`** - Advanced query input component for complex search syntax
- **`FilterOptions.test.tsx`** - Modal component for column and row filtering options

### UI Components
- **`ClearButton.test.tsx`** - Reusable clear button component
- **`ColumnFilter.test.tsx`** - Individual column item component for filter lists
- **`ColumnList.test.tsx`** - List component for displaying and selecting columns
- **`TransferButton.test.tsx`** - Button component for moving columns between lists

### Content Components
- **`ColumnFilterContent.test.tsx`** - Tab content for column filtering interface
- **`RowFilterContent.test.tsx`** - Tab content for row filtering interface

### Integration Tests
- **`index.test.tsx`** - Integration tests to verify all components can be imported and rendered

## Test Coverage

### Functionality Tested
- ✅ Component rendering with various props
- ✅ User interactions (clicks, keyboard navigation, input changes)
- ✅ State management and callbacks
- ✅ Search modes switching (Data, Columns, Rows)
- ✅ Filter functionality (column selection, transfer operations)
- ✅ Query parsing and validation
- ✅ Clear functionality
- ✅ Modal operations (open/close, tab switching)
- ✅ Accessibility features (ARIA attributes, keyboard navigation)
- ✅ Edge cases (empty data, undefined callbacks, rapid interactions)

### Test Categories
1. **Rendering Tests** - Verify components render correctly with different props
2. **Interaction Tests** - Test user interactions and event handling
3. **State Management Tests** - Verify state changes and callback functions
4. **Accessibility Tests** - Ensure proper ARIA attributes and keyboard navigation
5. **Edge Case Tests** - Handle error conditions and boundary cases
6. **Integration Tests** - Verify components work together correctly

## Running Tests

```bash
# Run all advanced search tests
npm test -- --testPathPattern=advancedsearch

# Run specific component tests
npm test -- --testPathPattern=AdvancedSearchComponent
npm test -- --testPathPattern=QueryAutoComplete
npm test -- --testPathPattern=FilterOptions

# Run with coverage
npm test -- --testPathPattern=advancedsearch --coverage
```

## Test Structure

Each test file follows this structure:
- **Imports** - React Testing Library, Jest, and component imports
- **Mock Setup** - Mock child components and external dependencies
- **Test Suites** - Organized by functionality (Rendering, Interactions, etc.)
- **Test Cases** - Individual test scenarios with descriptive names
- **Cleanup** - Proper cleanup between tests

## Mocking Strategy

- **Child Components** - Mocked to focus on parent component behavior
- **External Dependencies** - Mocked hooks and utilities (useDebounce, rsuite)
- **Event Handlers** - Jest functions for testing callback interactions
- **DOM APIs** - React Testing Library handles DOM interactions

## Key Testing Patterns

### Component Rendering
```typescript
it('renders with default props', () => {
  render(<Component {...defaultProps} />);
  expect(screen.getByTestId('component')).toBeInTheDocument();
});
```

### User Interactions
```typescript
it('handles user input', async () => {
  const onChange = jest.fn();
  render(<Component onChange={onChange} />);
  
  const input = screen.getByRole('textbox');
  await userEvent.type(input, 'test');
  
  expect(onChange).toHaveBeenCalledWith('test');
});
```

### State Changes
```typescript
it('updates state on interaction', async () => {
  render(<Component />);
  
  const button = screen.getByRole('button');
  await userEvent.click(button);
  
  expect(screen.getByText('Updated State')).toBeInTheDocument();
});
```

### Accessibility
```typescript
it('supports keyboard navigation', () => {
  render(<Component />);
  
  const button = screen.getByRole('button');
  button.focus();
  
  expect(button).toHaveFocus();
  fireEvent.keyDown(button, { key: 'Enter' });
});
```

## Dependencies

- **@testing-library/react** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers
- **jest** - Test runner and assertion library

## Notes

- All tests use the existing tech stack (React Testing Library, Jest)
- No new dependencies were introduced
- Tests maintain the same functionality and styling as the original components
- Mock components are simplified versions that focus on testing the parent component's behavior
- Tests are organized to be maintainable and easy to understand

