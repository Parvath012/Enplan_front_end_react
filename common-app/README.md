# Common App

This micro frontend module contains reusable components that are shared across `admin-app`, `home-app` and `budgeting-app`.

## Environment Variables

This application uses environment variables for API configuration. Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://your-api-server:port
REACT_APP_API_ENDPOINT=/api/v1/data/Data/ExecuteSqlQueries
REACT_APP_HEALTH_ENDPOINT=/api/v1/health
```

### Environment Variables Description:
- `REACT_APP_API_BASE_URL`: The base URL of your API server (e.g., `http://172.16.20.116:50005`)
- `REACT_APP_API_ENDPOINT`: The endpoint path for data queries
- `REACT_APP_HEALTH_ENDPOINT`: The endpoint path for server health checks

> **Note**: The `.env` file is ignored by git. Use `.env.example` as a template for your configuration.

## Running the Application

### `npm install`
Installs the dependencies for the project.

### `npm start`
Runs the app in development mode.  
Open [http://localhost:3002](http://localhost:3002) to view it in the browser.

### `npm test`
Runs the test suite in interactive watch mode.

### `npm run build`
Builds the app for production.

### `npm run eject`
Ejects the default configuration for further customization.

## Micro Frontend Integration
This app exposes shared components to `admin-app`, `home-app` and `budgeting-app` using Webpack Module Federation.

## Learn More
- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://create-react-app.dev/)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
