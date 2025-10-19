const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Improve Fast Refresh with NativeWind
config.watchFolders = [__dirname];
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'css'],
};

module.exports = withNativeWind(config, { input: './app/global.css' });
