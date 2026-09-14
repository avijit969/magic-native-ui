/**
 * Exports the playground as a static site into the docs project, one HTML file
 * per component, so documentation pages can embed a real running preview.
 *
 * The bundle is built into a staging directory and only then copied over the
 * live one: `expo export --clear` empties its output directory first, which
 * would leave the docs site serving 404s — a blank preview — for the minute or
 * so the build takes. Copying file by file rather than renaming the directory
 * keeps that publish step working on Windows, where a directory the dev server
 * is watching cannot be renamed.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PLAYGROUND = path.join(ROOT, 'apps', 'playground')
const OUTPUT = path.resolve(ROOT, '..', 'magic-native-ui-docs', 'public', 'playground')
const STAGING = `${OUTPUT}.tmp`
const BASE_URL = '/playground'

function exportWeb() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['expo', 'export', '-p', 'web', '--output-dir', STAGING, '--clear'],
      {
        cwd: PLAYGROUND,
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env: { ...process.env, MAGIC_PREVIEW_BASE_URL: BASE_URL, CI: '1' },
      }
    )

    child.on('error', reject)
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`expo export exited with code ${code}`))
    )
  })
}

/** Every path under `dir`, relative to it, files only. */
async function entries(dir) {
  if (!existsSync(dir)) return new Set()

  const found = await readdir(dir, { recursive: true, withFileTypes: true })

  return new Set(
    found
      .filter((entry) => entry.isFile())
      .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
  )
}

/**
 * New files land first so nothing is ever missing mid-publish; the leftovers
 * from the previous export — bundles under an old content hash, previews for
 * components that have gone — are removed afterwards.
 */
async function publish() {
  const [next, current] = await Promise.all([entries(STAGING), entries(OUTPUT)])

  await cp(STAGING, OUTPUT, { recursive: true, force: true })

  for (const file of current) {
    if (!next.has(file)) {
      await rm(path.join(OUTPUT, file), { force: true })
    }
  }

  await rm(STAGING, { recursive: true, force: true })
}

try {
  await rm(STAGING, { recursive: true, force: true })
  await exportWeb()
  await publish()

  console.log(`\nPreviews exported to ${OUTPUT} (base URL ${BASE_URL})`)
} catch (error) {
  await rm(STAGING, { recursive: true, force: true })

  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
