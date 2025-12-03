const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const webpack = require("webpack");
const deps = require("./package.json").dependencies;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const dotenv = require("dotenv");

// Load environment configuration with proper precedence
dotenv.config({ path: ".env" });
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
dotenv.config({ path: ".env.local"});

// Set default values for environment variables if not provided
process.env.REACT_APP_DATA_API_URL = process.env.REACT_APP_DATA_API_URL || 'http://172.16.20.116:50005';
process.env.REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://172.16.20.116:50001';
process.env.REACT_APP_USERS_API_URL = process.env.REACT_APP_USERS_API_URL || 'http://172.16.20.116:8081';
process.env.REACT_APP_ADMIN_API_URL = process.env.REACT_APP_ADMIN_API_URL || 'http://172.16.20.116:50003';
process.env.REACT_APP_USER_HIERARCHY_API_URL = process.env.REACT_APP_USER_HIERARCHY_API_URL || 'http://172.16.20.116:8881';
process.env.COMMON_APP_URL = process.env.COMMON_APP_URL || 'http://localhost:3002/remoteEntry.js';
process.env.HOME_APP_URL = process.env.HOME_APP_URL || 'http://localhost:3001/remoteEntry.js';
process.env.BUDGETING_APP_URL = process.env.BUDGETING_APP_URL || 'http://localhost:3003/remoteEntry.js';
process.env.DATA_MGMT_APP_URL = process.env.DATA_MGMT_APP_URL || 'http://localhost:3004/remoteEntry.js';
process.env.ENTITY_SETUP_APP_URL = process.env.ENTITY_SETUP_APP_URL || 'http://localhost:3005/remoteEntry.js';
process.env.USER_MANAGEMENT_APP_URL = process.env.USER_MANAGEMENT_APP_URL || 'http://localhost:3006/remoteEntry.js';

// Validate required environment variables for admin-app
const requiredEnvVars = [
  'REACT_APP_API_BASE_URL',
  'REACT_APP_USERS_API_URL',
  'REACT_APP_ADMIN_API_URL',
  'REACT_APP_USER_HIERARCHY_API_URL',
  'REACT_APP_DATA_API_URL',
  'COMMON_APP_URL',
  'HOME_APP_URL',
  'BUDGETING_APP_URL',
  'DATA_MGMT_APP_URL',
  'ENTITY_SETUP_APP_URL',
  'USER_MANAGEMENT_APP_URL'
];

const missing = requiredEnvVars.filter(varName => !process.env[varName]);
if (missing.length > 0) {
  console.warn(`⚠️ Admin App: Some environment variables are missing, using defaults:`);
  missing.forEach(varName => console.warn(`   - ${varName}`));
  console.warn(`\nConsider creating a .env file for custom configuration.`);
} else {
  console.log(`✓ Admin App: All required environment variables are present`);
}

module.exports = {
  entry: "./src/index",
  mode: process.env.NODE_ENV || "development",
  devServer: {
    port: 3000,
    historyApiFallback: true,
    allowedHosts: "all",
  },
  output: {
    publicPath: '/',
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
        type: "javascript/auto", // Allows JSON parsing
        use: [
          {
            loader: "json-loader", // Webpack can still use json-loader for explicit support
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
        { from: "public", to: ".", globOptions: { ignore: ["**/index.html"] } }
      ]
    }),
    new ModuleFederationPlugin({
      name: "adminApp",
      filename: "remoteEntry.js",
      exposes: {
        "./getJwtToken": "./src/utils/getJwtToken", // Optionally expose a utility function
      },
      remotes: {
        commonApp: `commonApp@${process.env.COMMON_APP_URL}`,
        homeApp: `homeApp@${process.env.HOME_APP_URL}`,
        budgetingApp: `budgetingApp@${process.env.BUDGETING_APP_URL}`,
        dataManagementApp: `dataManagementApp@${process.env.DATA_MGMT_APP_URL}`,
        entitySetupApp: `entitySetupApp@${process.env.ENTITY_SETUP_APP_URL}`,
        userManagementApp: `userManagementApp@${process.env.USER_MANAGEMENT_APP_URL}`,
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
        "@carbon/icons-react": {
          singleton: true,
          requiredVersion: deps["@carbon/icons-react"],
        },
        "@mui/material": {
          singleton: true,
          requiredVersion: deps["@mui/material"],
        },
        "@emotion/react": {
          singleton: true,
          requiredVersion: deps["@emotion/react"],
        },
        "@emotion/styled": {
          singleton: true,
          requiredVersion: deps["@emotion/styled"],
        },
      },
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
  ],
};
