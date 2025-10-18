const webpack = require('webpack');

module.exports = function override(config) {
  const newConfig = { ...config };

  newConfig.resolve = {
    ...newConfig.resolve,
    fallback: {
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      stream: require.resolve('stream-browserify'),
    },
  };

  newConfig.plugins = [
    ...(newConfig.plugins || []),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  return newConfig;
};
