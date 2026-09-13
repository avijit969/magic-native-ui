/**
 * Compiles registry.json into one JSON file per item, with every source file
 * inlined, so the CLI can install a component with a single fetch.
 *
 *   bun run scripts/build-registry.ts [--output <dir>]
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dir, '..')
const DEFAULT_OUTPUT = path.resolve(ROOT, '../magic-native-ui-docs/public/r')

type RegistryFile = {
  path: string
  type: string
  target?: string
}

type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
}

type Registry = {
  name: string
  homepage: string
  items: RegistryItem[]
}

function parseArgs(argv: string[]) {
  const outputIndex = argv.findIndex((arg) => arg === '--output' || arg === '-o')
  const output = outputIndex !== -1 ? argv[outputIndex + 1] : undefined

  if (outputIndex !== -1 && !output) {
    throw new Error('--output requires a directory path')
  }

  return { output: output ? path.resolve(process.cwd(), output) : DEFAULT_OUTPUT }
}

/** Fails the build rather than shipping a registry the CLI cannot resolve. */
function validate(registry: Registry) {
  const names = new Set(registry.items.map((item) => item.name))
  const errors: string[] = []

  for (const item of registry.items) {
    for (const dependency of item.registryDependencies ?? []) {
      // Dependencies on other registries are URLs or @namespace/name references.
      if (dependency.startsWith('http') || dependency.startsWith('@')) continue

      if (!names.has(dependency)) {
        errors.push(`"${item.name}" depends on unknown registry item "${dependency}"`)
      }
    }

    for (const file of item.files) {
      if (!existsSync(path.resolve(ROOT, file.path))) {
        errors.push(`"${item.name}" references missing file "${file.path}"`)
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid registry:\n  - ${errors.join('\n  - ')}`)
  }
}

async function build() {
  const { output } = parseArgs(process.argv.slice(2))
  const registry: Registry = JSON.parse(await readFile(path.resolve(ROOT, 'registry.json'), 'utf8'))

  validate(registry)
  await mkdir(output, { recursive: true })

  for (const item of registry.items) {
    const files = await Promise.all(
      item.files.map(async (file) => ({
        path: file.path,
        content: await readFile(path.resolve(ROOT, file.path), 'utf8'),
        type: file.type,
        ...(file.target ? { target: file.target } : {}),
      }))
    )

    const payload = {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      ...item,
      files,
    }

    await writeFile(path.join(output, `${item.name}.json`), `${JSON.stringify(payload, null, 2)}\n`)
  }

  // An index so the CLI can implement `list` and `search` without N fetches.
  const index = {
    name: registry.name,
    homepage: registry.homepage,
    items: registry.items.map(({ name, type, title, description, registryDependencies }) => ({
      name,
      type,
      title,
      description,
      registryDependencies,
    })),
  }

  await writeFile(path.join(output, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)

  console.log(`Built ${registry.items.length} registry items -> ${output}`)
}

build().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
