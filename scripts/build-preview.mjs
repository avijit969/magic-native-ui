/**
 * Exports the playground as a static site into the docs project, one HTML file
 * per component, so documentation pages can embed a real running preview.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PLAYGROUND = path.join(ROOT, 'apps', 'playground')
const OUTPUT = path.resolve(ROOT, '..', 'magic-native-ui-docs', 'public', 'playground')
const BASE_URL = '/playground'

const child = spawn(
  'npx',
  ['expo', 'export', '-p', 'web', '--output-dir', OUTPUT, '--clear'],
  {
    cwd: PLAYGROUND,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, MAGIC_PREVIEW_BASE_URL: BASE_URL, CI: '1' },
  }
)

child.on('close', (code) => {
  if (code === 0) {
    console.log(`\nPreviews exported to ${OUTPUT} (base URL ${BASE_URL})`)
  }

  process.exit(code ?? 1)
})
