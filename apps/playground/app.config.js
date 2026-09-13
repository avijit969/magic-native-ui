const { expo } = require('./app.json')

/**
 * Previews are hosted by the docs site under /playground, which requires the
 * bundle to reference its assets from that subpath. Only the preview export
 * sets this, so `expo start` and native builds are unaffected.
 */
module.exports = () => ({
  ...expo,
  experiments: {
    ...expo.experiments,
    baseUrl: process.env.MAGIC_PREVIEW_BASE_URL ?? '',
  },
})
