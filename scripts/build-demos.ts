/**
 * Copies the playground usage examples into the docs site, one JSON file per
 * component, so every documented component can show runnable usage code next
 * to its preview.
 *
 *   bun run scripts/build-demos.ts [--output <dir>]
 *
 * The sources import through `@/registry/...` because that is how they resolve
 * inside the playground. They are rewritten to the aliases a real project uses
 * — the same rewrite the CLI applies when it installs a component — so the code
 * on the docs page is the code a reader can paste into their own app.
 */
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dir, '..')
const DEMOS_DIR = path.resolve(ROOT, 'apps/playground/components/demos')
const DEFAULT_OUTPUT = path.resolve(ROOT, '../magic-native-ui-docs/public/r/demos')

type RegistryItem = { name: string; type: string }
type Registry = { items: RegistryItem[] }

function parseArgs(argv: string[]) {
  const outputIndex = argv.findIndex((arg) => arg === '--output' || arg === '-o')
  const output = outputIndex !== -1 ? argv[outputIndex + 1] : undefined

  if (outputIndex !== -1 && !output) {
    throw new Error('--output requires a directory path')
  }

  return { output: output ? path.resolve(process.cwd(), output) : DEFAULT_OUTPUT }
}

function transformImports(content: string): string {
  return content
    .replaceAll('@/registry/lib/utils', '@/lib/utils')
    .replace(/@\/registry\/lib\/([\w.-]+)/g, '@/lib/$1')
    .replace(/@\/registry\/ui\/([\w.-]+)/g, '@/components/ui/$1')
    .replace(/@\/registry\/hooks\/([\w.-]+)/g, '@/hooks/$1')
}

async function build() {
  const { output } = parseArgs(process.argv.slice(2))
  const registry: Registry = JSON.parse(await readFile(path.resolve(ROOT, 'registry.json'), 'utf8'))
  const components = registry.items.filter((item) => item.type === 'registry:ui')

  const files = (await readdir(DEMOS_DIR)).filter((file) => file.endsWith('-demo.tsx'))
  const built = new Set<string>()

  await mkdir(output, { recursive: true })

  for (const file of files) {
    const name = file.replace(/-demo\.tsx$/, '')
    const source = await readFile(path.join(DEMOS_DIR, file), 'utf8')

    const payload = { name, path: file, content: transformImports(source) }

    await writeFile(path.join(output, `${name}.json`), `${JSON.stringify(payload, null, 2)}\n`)
    built.add(name)
  }

  // A component without an example is documented with an empty Usage tab, so
  // say so rather than letting it pass unnoticed.
  const missing = components.filter((item) => !built.has(item.name)).map((item) => item.name)

  if (missing.length > 0) {
    console.warn(`No usage example for: ${missing.join(', ')}`)
  }

  console.log(`Built ${built.size} usage examples -> ${output}`)
}

build().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
