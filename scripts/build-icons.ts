/**
 * Compiles @hugeicons/core-free-icons into the data the CLI and the docs
 * gallery read: a small index of every icon, plus fixed-size shards holding the
 * path data. Sharding is what keeps `icon add heart` a ~300 KB fetch instead of
 * the 6.18 MB upstream barrel.
 *
 *   bun run scripts/build-icons.ts [--output <dir>]
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dir, '..')
const DEFAULT_OUTPUT = path.resolve(ROOT, '../magic-native-ui-docs/public/r/icons')
const PACKAGE = '@hugeicons/core-free-icons'

/** Sorted icons per shard. ~250 keeps each shard around 300 KB. */
const SHARD_SIZE = 250

type IconSvgElement = readonly (readonly [string, Record<string, string | number>])[]

function parseArgs(argv: string[]) {
  const outputIndex = argv.findIndex((arg) => arg === '--output' || arg === '-o')
  const output = outputIndex !== -1 ? argv[outputIndex + 1] : undefined

  if (outputIndex !== -1 && !output) {
    throw new Error('--output requires a directory path')
  }

  return { output: output ? path.resolve(process.cwd(), output) : DEFAULT_OUTPUT }
}

/**
 * `HeartIcon` -> `heart`, `Add01Icon` -> `add-01`, `AArrowDownIcon` ->
 * `a-arrow-down`. The `Icon` suffix is dropped from the registry name but kept
 * on the export, so a project's imports match the upstream Hugeicons docs.
 */
export function toRegistryName(exportName: string): string {
  return exportName
    .replace(/(FreeIcons|Icons|Icon)$/, '')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .replace(/(\d)([A-Za-z])/g, '$1-$2')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/**
 * Upstream ships the same icon under several export names. The canonical one is
 * the `*Icon` spelling with the least shouting — `ArrowDownAzIcon` rather than
 * `ArrowDownAZIcon` or the bare `ArrowDown` alias.
 */
function pickCanonical(names: string[]): string {
  const suffixed = names.filter((name) => /(?<!Free)Icon$/.test(name))
  const candidates = suffixed.length > 0 ? suffixed : names

  return [...candidates].sort((a, b) => {
    const shouting = (name: string) => (name.match(/[A-Z]{2,}/g) ?? []).length

    return shouting(a) - shouting(b) || a.length - b.length || (a < b ? -1 : 1)
  })[0]!
}

async function resolveVersion(): Promise<string> {
  const manifest = path.resolve(ROOT, 'node_modules', PACKAGE, 'package.json')
  const { version } = JSON.parse(await readFile(manifest, 'utf8'))

  return version as string
}

type Icon = {
  name: string
  export: string
  aliases: string[]
  data: IconSvgElement
}

/**
 * Groups every export that resolves to the same drawing. Shared array identity
 * catches the `X as XFreeIcons` aliases; comparing the serialised data on top of
 * that catches the handful of icons duplicated under two casings.
 */
function collectIcons(barrel: Record<string, IconSvgElement>): Icon[] {
  const byReference = new Map<IconSvgElement, string[]>()

  for (const [name, data] of Object.entries(barrel)) {
    if (name === 'default' || !Array.isArray(data)) continue

    const group = byReference.get(data)

    if (group) group.push(name)
    else byReference.set(data, [name])
  }

  const byRegistryName = new Map<string, Icon>()

  for (const [data, names] of byReference) {
    const canonical = pickCanonical(names)
    const name = toRegistryName(canonical)
    const existing = byRegistryName.get(name)

    if (existing) {
      if (JSON.stringify(existing.data) !== JSON.stringify(data)) {
        throw new Error(
          `"${name}" is claimed by two different icons: ${existing.export} and ${canonical}`
        )
      }

      // Same drawing under a second casing — fold it in and re-pick the export,
      // so `ArrowDownAzIcon` wins over `ArrowDownAZIcon` whichever came first.
      existing.aliases.push(...names)
      existing.export = pickCanonical(existing.aliases)
      continue
    }

    byRegistryName.set(name, { name, export: canonical, aliases: [...names], data })
  }

  const icons = [...byRegistryName.values()].sort((a, b) => a.name.localeCompare(b.name))

  // An alias is only useful if it points somewhere unambiguous: drop any that
  // shadows a real icon, or that two different icons both claim.
  const claims = new Map<string, number>()

  for (const icon of icons) {
    for (const alias of new Set(icon.aliases.map(toRegistryName))) {
      if (!alias || alias === icon.name) continue

      claims.set(alias, (claims.get(alias) ?? 0) + 1)
    }
  }

  return icons.map((icon) => ({
    ...icon,
    aliases: [...new Set(icon.aliases.map(toRegistryName))]
      .filter(
        (alias) =>
          alias && alias !== icon.name && claims.get(alias) === 1 && !byRegistryName.has(alias)
      )
      .sort((a, b) => a.localeCompare(b)),
  }))
}

async function build() {
  const { output } = parseArgs(process.argv.slice(2))
  const version = await resolveVersion()

  // The barrel is only ever loaded here, at build time, never by a consumer.
  const icons = collectIcons(await import(PACKAGE))

  if (icons.length === 0) {
    throw new Error(`No icons found in ${PACKAGE}`)
  }

  await rm(output, { recursive: true, force: true })
  await mkdir(path.join(output, 'shards'), { recursive: true })

  const index: { name: string; export: string; shard: number; aliases?: string[] }[] = []

  for (let shard = 0; shard * SHARD_SIZE < icons.length; shard += 1) {
    const slice = icons.slice(shard * SHARD_SIZE, (shard + 1) * SHARD_SIZE)
    const payload: Record<string, IconSvgElement> = {}

    for (const icon of slice) {
      payload[icon.name] = icon.data
      index.push({
        name: icon.name,
        export: icon.export,
        shard,
        ...(icon.aliases.length > 0 ? { aliases: icon.aliases } : {}),
      })
    }

    await writeFile(path.join(output, 'shards', `${shard}.json`), JSON.stringify(payload))
  }

  await writeFile(
    path.join(output, 'index.json'),
    `${JSON.stringify(
      {
        source: PACKAGE,
        version,
        license: 'MIT',
        shardSize: SHARD_SIZE,
        count: index.length,
        items: index,
      },
      null,
      2
    )}\n`
  )

  const shards = Math.ceil(icons.length / SHARD_SIZE)

  console.log(
    `Built ${index.length} icons from ${PACKAGE}@${version} across ${shards} shards -> ${output}`
  )
}

build().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
