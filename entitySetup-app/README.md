# Enity Setup App

This is the main module of the micro frontend architecture. It serves as the host application and integrates remote modules.

## Running the Application

### `npm install`
Installs the dependencies required for the project.

### `npm start`
Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production, optimizing the output for performance.

### `npm run eject`
Ejects the default Create React App configuration for customization.

## Micro Frontend Integration
This app acts as a host and consumes remote apps like `home-app`, `common-app` and `budgeting-app` using Webpack Module Federation.

## Learn More
- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://create-react-app.dev/)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
