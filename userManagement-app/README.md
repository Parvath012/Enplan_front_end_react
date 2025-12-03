# User Management App

This is a micro-frontend application for user management functionality in the EnPlan 2.0 system.

## Features

- **Welcome Page**: Initial setup page with continue button
- **User Creation Form**: Comprehensive form with Basic Details, Account Details, and Reporting Details sections
- **User List**: Table view with search, filter, and action capabilities
- **User Management**: Full CRUD operations for user data

## Running the Application

### `npm install`
Installs the dependencies required for the project.

### `npm start`
Runs the app in development mode.  
Open [http://localhost:3006](http://localhost:3006) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production, optimizing the output for performance.

## Environment Variables

The following environment variables are required:

- `REACT_APP_USER_MANAGEMENT_API_URL`: API base URL for user management operations
- `COMMON_APP_URL`: URL for the common app micro-frontend

## Integration with Admin App

This app is designed to be integrated as a micro-frontend within the admin-app. When running the admin-app, navigate to `/admin/user-management` to access the user management functionality.

## Database Schema

The app uses the following table structure:

- **Table Name**: `user_management`
- **Key Fields**: id, firstname, lastname, emailid, role, department, reportingmanager, etc.
- **Status Management**: Active/Inactive user status with toggle functionality
- **Audit Fields**: createdat, lastupdatedat, createdby, lastupdatedby

## User Stories Implemented

- **UM_US_107**: Welcome page with continue button
- **UM_US_108**: User creation form with comprehensive details
- **UM_US_111**: Action buttons (Reset, Cancel, Back) with proper behavior
- **UM_US_123**: User list with search, filter, and management capabilities

## Micro Frontend Integration
This app is consumed by the admin-app using Webpack Module Federation.

## Learn More
- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://create-react-app.dev/)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
