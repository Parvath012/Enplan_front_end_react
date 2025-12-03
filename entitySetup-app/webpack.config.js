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
process.env.REACT_APP_DATA_API_URL = process.env.REACT_APP_DATA_API_URL || 'http://172.16.20.116:50005';
process.env.REACT_APP_ENTITY_HIERARCHY_API_URL = process.env.REACT_APP_ENTITY_HIERARCHY_API_URL || 'http://172.16.20.116:8888';
process.env.COMMON_APP_URL = process.env.COMMON_APP_URL || 'http://localhost:3002/remoteEntry.js';
process.env.USER_MANAGEMENT_APP_URL = process.env.USER_MANAGEMENT_APP_URL || 'http://localhost:3006/remoteEntry.js';

// Validate required environment variables for entitySetup-app
const requiredEnvVars = [
  'REACT_APP_ENTITY_HIERARCHY_API_URL',
  'REACT_APP_DATA_API_URL'
];

const missing = requiredEnvVars.filter(varName => !process.env[varName]);
if (missing.length > 0) {
  console.warn(`⚠️ Entity Setup App: Some environment variables are missing, using defaults:`);
  missing.forEach(varName => console.warn(`   - ${varName}`));
  console.warn(`\nConsider creating a .env file for custom configuration.`);
} else {
  console.log(`✓ Entity Setup App: All required environment variables are present`);
}

module.exports = {
  entry: "./src/index",
  mode: process.env.NODE_ENV || "development",
  devServer: {
    port: 3005,
    historyApiFallback: true,
    allowedHosts: "all",
    proxy: [{
      context: ['/api'],
      target: 'http://localhost:8081',
      changeOrigin: true,
      secure: false,
    }],
  },
  output: {
    publicPath: 'auto',
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
      // JSON imports are supported natively by Webpack 5; no loader needed
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
      name: "entitySetupApp",
      filename: "remoteEntry.js",
      exposes: {
        "./EntitySetupApp": "./src/App",
      },
      remotes: {
        commonApp: `commonApp@${process.env.COMMON_APP_URL}`,
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
