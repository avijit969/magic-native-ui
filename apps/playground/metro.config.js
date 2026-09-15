// Learn more: https://docs.expo.dev/guides/monorepo/
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')
const path = require('node:path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// The registry lives at the workspace root, outside this app, so Metro has to
// watch it for component edits to trigger a reload.
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// React Native itself still relies on deep imports such as
// `react-native/rn-get-polyfills`, which break when package exports are on.
// Uniwind (with its culori dependency) requires the opposite, so exports are
// disabled globally and re-enabled for just those.
// https://docs.uniwind.dev/faq
const PACKAGE_EXPORTS_ALLOWLIST = ['uniwind', 'culori']

config.resolver.unstable_enablePackageExports = false
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (PACKAGE_EXPORTS_ALLOWLIST.some((prefix) => moduleName.startsWith(prefix))) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: true },
      moduleName,
      platform
    )
  }

  return context.resolveRequest(context, moduleName, platform)
}

// `withUniwindConfig` must stay the outermost wrapper.
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
})
