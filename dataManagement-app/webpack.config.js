const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const webpack = require("webpack");
const deps = require("./package.json").dependencies;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const dotenv = require("dotenv");

// Load environment configuration with proper precedence
dotenv.config({ path: ".env" });
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
dotenv.config({ path: ".env.local" });

// Set default values for environment variables if not provided
process.env.COMMON_APP_URL = process.env.COMMON_APP_URL || 'http://localhost:3002/remoteEntry.js';
process.env.REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:50005';
process.env.REACT_APP_PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:4001';

// Validate required environment variables for dataManagement-app
const requiredEnvVars = [
  'COMMON_APP_URL'
];

const missing = requiredEnvVars.filter(varName => !process.env[varName]);
if (missing.length > 0) {
  console.warn(`⚠️ Data Management App: Some environment variables were missing, using defaults:`);
  missing.forEach(varName => console.warn(`   - ${varName}`));
} else {
  console.log(`✓ Data Management App: All required environment variables are present`);
}

module.exports = {
  entry: "./src/index",
  mode: process.env.NODE_ENV || "development",
  devServer: {
    port: 3004,
    historyApiFallback: true,
    allowedHosts: "all",
  },
  output: {
    publicPath: 'auto',
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    fallback: {
      https: false
    }
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
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
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
      name: 'dataManagementApp',
      filename: "remoteEntry.js",
      exposes: {
        "./DataManagementApp": "./src/App",
      },
      remotes: {
        commonApp: `commonApp@${process.env.COMMON_APP_URL}`,
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
          eager: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          eager: true,
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
        "@carbon/icons-react": {
          singleton: true,
          eager: true,
          requiredVersion: deps["@carbon/icons-react"],
        },
      },
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
  ],
};
