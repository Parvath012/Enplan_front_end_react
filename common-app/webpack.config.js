const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const webpack = require("webpack");
const deps = require("./package.json").dependencies;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const dotenv = require("dotenv");

// Load environment configuration with proper precedence
dotenv.config({ path: ".env" });
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
dotenv.config({ path: ".env.local", override: true });

// Set default values for environment variables if not provided
process.env.REACT_APP_DATA_API_URL = process.env.REACT_APP_DATA_API_URL || 'http://172.16.20.116:50005';
process.env.REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://172.16.20.116:50001';
process.env.REACT_APP_API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || '/api/v1/data/Data/ExecuteSqlQueries';
process.env.REACT_APP_HEALTH_ENDPOINT = process.env.REACT_APP_HEALTH_ENDPOINT || '/api/v1/health';

// Validate required environment variables for common-app
const requiredEnvVars = [
  'REACT_APP_API_BASE_URL',
  'REACT_APP_API_ENDPOINT',
  'REACT_APP_HEALTH_ENDPOINT'
];

const missing = requiredEnvVars.filter(varName => !process.env[varName]);
if (missing.length > 0) {
  console.warn(`⚠️ Common App: Some environment variables are missing, using defaults:`);
  missing.forEach(varName => console.warn(`   - ${varName}`));
  console.warn(`\nConsider creating a .env file for custom configuration.`);
} else {
  console.log(`✓ Common App: All required environment variables are present`);
}

module.exports = {
  entry: "./src/index",
  mode: process.env.NODE_ENV || "development",
  devServer: {
    port: 3002,
    historyApiFallback: true,
    allowedHosts: "all",
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: false,
      },
    },
  },
  output: {
    publicPath: "auto",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.json$/,
        type: "javascript/auto",
        use: [
          {
            loader: "json-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          globOptions: { ignore: ["**/index.html"] },
        },
      ],
    }),
    new ModuleFederationPlugin({
      name: "commonApp",
      filename: "remoteEntry.js",
      exposes: {
        "./CommonApp": "./src/App",
        "./CustomTooltip": "./src/components/common/CustomTooltip",
        "./timeUtils": "./src/utils/timeUtils",
        
        // Common Components
        "./CircularLoader": "./src/components/common/CircularLoader",
        "./CustomCheckbox": "./src/components/common/CustomCheckbox",
        "./NotificationAlert": "./src/components/common/NotificationAlert",
        "./ToggleSwitch": "./src/components/common/ToggleSwitch",
        "./FileUpload": "./src/components/common/FileUpload",
        "./ReadOnlyField": "./src/components/common/ReadOnlyField",
        "./NoResultsFound": "./src/components/common/NoResultsFound",
        "./Panel": "./src/components/common/Panel/Panel",
        "./Card": "./src/components/common/Card",
        
        // Form Field Components
        "./TextField": "./src/components/form-fields/TextField",
        "./SelectField": "./src/components/form-fields/SelectField",
        "./MultiSelectField": "./src/components/form-fields/MultiSelectField",
        
        // Layout Components
        "./FormHeader": "./src/components/layout/FormHeader",
        "./FormHeaderWithTabs": "./src/components/layout/FormHeaderWithTabs",
        "./FormHeaderBase": "./src/components/layout/FormHeaderBase",
        "./FormFooter": "./src/components/layout/FormFooter",
        "./FormSection": "./src/components/layout/FormSection",
        "./HeaderBar": "./src/components/layout/HeaderBar",
        "./Footer": "./src/components/layout/Footer",
        "./WelcomePage": "./src/components/pages/WelcomePage",
        "./FormHeaderButtons": "./src/components/layout/FormHeaderButtons",
        "./FormHeaderTypes": "./src/types/FormHeaderTypes",
        "./apiServiceUtils": "./src/services/apiServiceUtils",
        "./iconUtils": "./src/utils/iconUtils",
        
        // Toolbar Components
        "./ListToolbar": "./src/components/toolbar/ListToolbar",
        
        // Grid Components
        "./AgGridShell": "./src/components/grid/AgGridShell",
        
        // Utility Components
        "./SearchField": "./src/components/utility/SearchField",
        "./ListItem": "./src/components/utility/ListItem",
        
        // Custom Components
        "./CustomRadio": "./src/components/custom/CustomRadio",
        "./CustomSlider": "./src/components/custom/CustomSlider",
        
        // Shared Components
        "./HeaderIcons": "./src/components/shared/HeaderIcons",
        "./shared": "./src/components/shared/index",
        
        // Common Components Export
        "./common": "./src/components/common/index",
        
        // Utils
        "./imageUtils": "./src/utils/imageUtils",
        "./formatUtils": "./src/utils/formatUtils",
        "./searchUtils": "./src/utils/searchUtils",
        "./apiUtils": "./src/utils/apiUtils",
        "./stringUtils": "./src/utils/stringUtils",
        "./cellRenderers": "./src/utils/cellRenderers",
        
        // Hierarchy/Structure Components (shared across Entity and User Management apps)
        "./ZoomControls": "./src/components/hierarchy/ZoomControls",
        "./UserNode": "./src/components/hierarchy/UserNode",
        "./HierarchyFlowRenderer": "./src/components/hierarchy/HierarchyFlowRenderer",
        "./hierarchyConstants": "./src/constants/hierarchyConstants",
        "./useContainerDetection": "./src/hooks/useContainerDetection",
        "./useHierarchyZoom": "./src/hooks/useHierarchyZoom",
        "./useHierarchyDataProcessing": "./src/hooks/useHierarchyDataProcessing",
        "./hierarchyPanelStyles": "./src/constants/hierarchyPanelStyles",
        "./hierarchyUtils": "./src/utils/hierarchyUtils",
        "./graphLayoutUtils": "./src/utils/graphLayoutUtils",
        "./apiErrorHandler": "./src/utils/apiErrorHandler",
        "./hierarchyApiService": "./src/services/hierarchyApiService",
        
        // Main Components Export
        "./components": "./src/components/index",
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
        "@mui/material": {
          singleton: true,
          version: "7.0.2",
        },
        "@emotion/react": {
          singleton: true,
          version: "11.14.0",
        },
        "@emotion/styled": {
          singleton: true,
          version: "11.14.0",
        },
        "@mui/x-data-grid": {
          singleton: true,
          version: "8.3.0",
        },
        "@carbon/icons-react": {
          singleton: true,
          requiredVersion: deps["@carbon/icons-react"],
        },
      },
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
  ],
};
