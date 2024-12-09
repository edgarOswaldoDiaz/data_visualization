const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');  // Importa el plugin

module.exports = {
  entry: './frontend/main.js',  // Ruta a tu archivo principal de JavaScript
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Limpia el directorio de salida antes de cada build
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,  // Para procesar styles.css
        use: [
          MiniCssExtractPlugin.loader,  // Extrae el CSS
          'css-loader'  // Procesa el CSS
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './frontend/index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css'  
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'frontend/styles.css', to: 'styles.css' }
      ]
    })
  ],
  mode: 'production'
};
