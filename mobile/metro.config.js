const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch both project and workspace root
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and enforce singleton React
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  '@react-navigation/native': path.resolve(projectRoot, 'node_modules/@react-navigation/native'),
  '@react-navigation/bottom-tabs': path.resolve(projectRoot, 'node_modules/@react-navigation/bottom-tabs'),
  '@react-navigation/native-stack': path.resolve(projectRoot, 'node_modules/@react-navigation/native-stack'),
  'react-native-safe-area-context': path.resolve(projectRoot, 'node_modules/react-native-safe-area-context'),
  'react-native-screens': path.resolve(projectRoot, 'node_modules/react-native-screens'),
  'react-native-svg': path.resolve(projectRoot, 'node_modules/react-native-svg'),
  'expo-constants': path.resolve(projectRoot, 'node_modules/expo-constants'),
};

config.resolver.disableHierarchicalLookup = true;

module.exports = config;
