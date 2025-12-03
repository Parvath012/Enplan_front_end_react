# Entity Configuration System

## Overview
The Entity Configuration System provides a comprehensive interface for configuring entity settings through a tabbed interface. Users can access this system by clicking the "Configure" or "View" button from the Entity List page.

## Features

### 1. Tabbed Interface
- **Countries and Currencies**: Configure countries of operation and associated currencies
- **Period Setup**: Set fiscal year, reporting periods, and planning horizons
- **Modules**: Configure business modules and functionality

### 2. Edit/View Modes
- **Configure Mode**: Opens in edit mode, allowing users to modify settings
- **View Mode**: Opens in read-only mode, displaying current configuration

### 3. Action Buttons
- **Edit Mode**: Save, Reset, Next/Finish buttons
- **View Mode**: Edit, Next/Finish buttons
- **Entity Type Specific**: 
  - Rollup entities show "Finish" on Modules tab
  - Planning entities show "Next" on Modules tab

## Component Structure

```
src/components/entityConfiguration/
├── EntityConfigurationLayout.tsx    # Main layout with tabs and navigation
├── CountriesAndCurrencies.tsx       # Countries and currencies configuration
├── PeriodSetup.tsx                  # Period and fiscal year setup
├── Modules.tsx                      # Business modules configuration
└── index.ts                         # Component exports
```

## Usage

### From Entity List
1. Click "Configure" button → Opens in edit mode
2. Click "View" button → Opens in read-only mode

### Navigation
- Use tabs to navigate between configuration sections
- Progress bar shows completion status
- Back button returns to Entity List

### Configuration Flow
1. **Countries and Currencies**: Select countries and currencies
2. **Period Setup**: Configure fiscal year and reporting periods
3. **Modules**: Select business modules based on entity type

## Key Features

### Countries and Currencies
- Four-column layout matching design requirements
- Search functionality for countries and currencies
- Sortable tables for selected items
- Default currency selection

### Period Setup
- Fiscal year start/end configuration
- Reporting period selection (monthly, quarterly, etc.)
- Planning horizon settings
- Rolling forecast configuration

### Modules
- Categorized module selection
- Required vs. optional modules
- Entity type-specific requirements
- Custom module addition capability

## State Management
- Uses Redux for entity data
- Local state for form inputs and selections
- Edit mode state management
- Tab navigation state

## Styling
- Material-UI components
- Consistent with existing design system
- Responsive layout
- Progress indicators and visual feedback

## Future Enhancements
- API integration for real data
- Validation and error handling
- Save/load configuration states
- Advanced module dependencies
- Configuration templates
