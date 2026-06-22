// Metro config for the pnpm monorepo: watch the workspace root and resolve
// modules from both the app's and the root node_modules (so @laundry/shared
// and hoisted deps resolve). See https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// NOTE: keep hierarchical lookup ENABLED for pnpm — its nested .pnpm layout
// requires Metro to walk up node_modules to resolve transitive deps
// (e.g. @expo/metro-runtime). Disabling it is only right for hoisted (npm/yarn).

module.exports = config;
