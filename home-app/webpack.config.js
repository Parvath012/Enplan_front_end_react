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

// Validate required environment variables for home-app
const requiredEnvVars = [
  'COMMON_APP_URL'
];

const missing = requiredEnvVars.filter(varName => !process.env[varName]);
if (missing.length > 0) {
  console.error(`❌ Home App: Missing required environment variables:`);
  missing.forEach(varName => console.error(`   - ${varName}`));
  console.error(`\nPlease check your environment configuration files.`);
  process.exit(1);
}

console.log(`✓ Home App: All required environment variables are present`);

module.exports = {
  entry: "./src/index",
  mode: process.env.NODE_ENV || "development",
  devServer: {
    port: 3001,
    historyApiFallback: true,
    allowedHosts: "all",
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
        use: ["style-loader", "css-loader", "postcss-loader"],
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
      name: "homeApp",
      filename: "remoteEntry.js",
      exposes: {
        "./HomeApp": "./src/App",
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
