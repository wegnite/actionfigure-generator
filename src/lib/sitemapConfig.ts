import fs from 'fs'
import path from 'path'

export type TrafficAllowlist = {
  locales?: string[]
  paths: string[]
}

function tryReadJson<T = unknown>(filePath: string): T | null {
  try {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
    if (!fs.existsSync(abs)) return null
    const raw = fs.readFileSync(abs, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getTrafficAllowlist(): TrafficAllowlist | null {
  // Priority: explicit env path -> default locations
  const candidatePaths = [
    process.env.SITEMAP_ALLOWLIST_PATH,
    'docs/seo/sitemap-allowlist.json',
    'docs/sitemap-allowlist.json',
  ].filter(Boolean) as string[]

  for (const p of candidatePaths) {
    const data = tryReadJson<TrafficAllowlist>(p)
    if (data && Array.isArray(data.paths)) return data
  }
  return null
}

export function getIncludedLocales(defaultLocales: string[]): string[] {
  const envLocales = (process.env.NEXT_PUBLIC_SITEMAP_LOCALES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  let locales = envLocales.length > 0 ? envLocales : defaultLocales

  const allow = getTrafficAllowlist()
  if (allow?.locales && allow.locales.length > 0) {
    // intersect to ensure consistency
    const allowSet = new Set(allow.locales)
    locales = locales.filter((l) => allowSet.has(l))
    if (locales.length === 0) locales = defaultLocales
  }
  return locales
}

