# EntitySetup App Loader Improvements

## Overview
This document describes the improvements made to the loading behavior in the EntitySetup app to ensure that only the content area shows a loader while the header and sidebar remain unchanged.

## Problem
Previously, when navigating to the Entity-Setup section from the Admin app, the entire page would refresh and show a full-screen loader that covered the header and sidebar. This created a poor user experience as users lost context of their location in the application.

## Solution
Created a new `ContentLoader` component that:
1. Only covers the content area of the EntitySetup app
2. Preserves the header and sidebar visibility
3. Provides visual feedback that the content is loading
4. Uses a semi-transparent backdrop with blur effect

## Changes Made

### 1. New ContentLoader Component
- **File**: `src/components/common/ContentLoader.tsx`
- **Purpose**: Replaces the full-screen CircularLoader with a content-specific loader
- **Features**:
  - Positioned absolutely within the content container
  - Semi-transparent backdrop with blur effect
  - Centered circular loading animation
  - Configurable size, colors, thickness, and speed

### 2. Updated EntitySetup Component
- **File**: `src/pages/entitySetup/EntitySetup.tsx`
- **Changes**:
  - Replaced CircularLoader import with ContentLoader
  - Wrapped content in a relative-positioned container
  - Added conditional rendering of ContentLoader during loading states
  - Maintained existing routing logic

### 3. Testing
- **File**: `tests/components/common/ContentLoader.test.tsx`
- **Coverage**: Tests for rendering, custom props, and functionality

## Technical Details

### Positioning Strategy
The ContentLoader uses `position: absolute` within a `position: relative` container, ensuring it only covers the EntitySetup content area without affecting the Admin app's header and sidebar.

### Z-Index Management
- ContentLoader uses `z-index: 1000` to appear above content but below modals
- Admin app header uses `z-index: 1000`
- Admin app sidebar uses `z-index: 1100`

### Responsive Design
The loader adapts to the content area size and maintains proper positioning across different screen sizes.

## Usage
The ContentLoader is automatically used by the EntitySetup component during loading states. No additional configuration is required.

## Benefits
1. **Improved UX**: Users maintain context of their location in the application
2. **Consistent Navigation**: Header and sidebar remain interactive during content loading
3. **Visual Feedback**: Clear indication that content is loading without blocking the entire interface
4. **Performance**: Faster perceived performance as the UI remains responsive

## Future Enhancements
- Add loading progress indicators
- Implement skeleton loading for specific content types
- Add loading state management for individual routes
