/**
 * NBA API Utilities
 *
 * HTTP client, file I/O, rate limiting, and response normalization.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

import {
  STATS_BASE_URL,
  LIVE_BASE_URL,
  STATS_HEADERS,
  LIVE_HEADERS,
  DEFAULTS,
} from './config.js'
import type {
  NbaResponse,
  NormalizedResponse,
  RawStatsResponse,
  RawResultSet,
  ClientTier,
} from './types.js'

// =============================================================================
// Types
// =============================================================================

export interface FetchClient {
  get: (url: string, options?: { timeout?: number }) => Promise<Response>
}

export interface PuppeteerClient {
  get: (url: string) => Promise<string>
  close: () => Promise<void>
}

export type HttpClient = FetchClient | PuppeteerClient

// =============================================================================
// HTTP Client Factory
// =============================================================================

/**
 * Create a Tier 1 HTTP client using native fetch with proper headers.
 */
export function createFetchClient(headers: Record<string, string> = STATS_HEADERS): FetchClient {
  return {
    async get(url: string, options?: { timeout?: number }): Promise<Response> {
      const controller = new AbortController()
      const timeout = options?.timeout ?? DEFAULTS.TIMEOUT

      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        })
        return response
      } finally {
        clearTimeout(timeoutId)
      }
    },
  }
}

/**
 * Create a Tier 2 HTTP client using Puppeteer with stealth plugin.
 * This is used as a fallback when native fetch fails due to anti-bot measures.
 */
export async function createPuppeteerClient(): Promise<PuppeteerClient> {
  // Dynamic import to make puppeteer optional
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let puppeteerModule: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stealthPluginModule: any

  try {
    puppeteerModule = await import('puppeteer-extra')
    stealthPluginModule = await import('puppeteer-extra-plugin-stealth')
  } catch {
    throw new Error(
      'Puppeteer is not installed. Install puppeteer-extra and puppeteer-extra-plugin-stealth for Tier 2 client support.'
    )
  }

  const puppeteer = puppeteerModule.default ?? puppeteerModule
  const StealthPlugin = stealthPluginModule.default ?? stealthPluginModule

  puppeteer.use(StealthPlugin())

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  const page = await browser.newPage()

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  )

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  })

  return {
    async get(url: string): Promise<string> {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

      // Extract JSON from page (NBA API returns JSON in pre tag or body)
      const bodyText: string = await page.evaluate(() => {
        const pre = document.querySelector('pre')
        if (pre) return pre.textContent ?? ''
        return document.body.textContent ?? ''
      })

      return bodyText
    },

    async close(): Promise<void> {
      await page.close()
      await browser.close()
    },
  }
}

// =============================================================================
// Main Fetch Functions
// =============================================================================

/**
 * Fetch data from NBA Stats API with tiered client fallback.
 */
export async function fetchStats(
  endpoint: string,
  params: Record<string, string | number | boolean | null | undefined> = {},
  options: {
    timeout?: number
    clientTier?: ClientTier
    headers?: Record<string, string>
  } = {}
): Promise<NbaResponse> {
  const { timeout = DEFAULTS.TIMEOUT, clientTier = 'tier1', headers = STATS_HEADERS } = options

  // Build URL with parameters
  const url = new URL(`${STATS_BASE_URL}/${endpoint}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value))
    }
  }

  // Sort parameters alphabetically
  const sortedParams = new URLSearchParams(
    [...url.searchParams.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  )
  const fullUrl = `${STATS_BASE_URL}/${endpoint}?${sortedParams.toString()}`

  const tiers: ClientTier[] = clientTier === 'auto' ? ['tier1', 'tier2'] : [clientTier]

  let lastError: Error | null = null

  for (const tier of tiers) {
    try {
      if (tier === 'tier1') {
        const client = createFetchClient(headers)
        const response = await client.get(fullUrl, { timeout })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const text = await response.text()

        // DoS protection: reject responses larger than 10MB
        const MAX_RESPONSE_SIZE = 10 * 1024 * 1024
        if (text.length > MAX_RESPONSE_SIZE) {
          throw new Error(`Response too large: ${text.length} bytes exceeds ${MAX_RESPONSE_SIZE} byte limit`)
        }

        let data: unknown

        try {
          data = JSON.parse(text)
        } catch {
          throw new Error(`Invalid JSON response from ${endpoint}`)
        }

        return {
          url: fullUrl,
          statusCode: response.status,
          data: normalizeResponse(data as RawStatsResponse),
          raw: data,
        }
      } else if (tier === 'tier2') {
        const client = await createPuppeteerClient()

        try {
          const text = await client.get(fullUrl)

          // DoS protection: reject responses larger than 10MB
          const MAX_RESPONSE_SIZE = 10 * 1024 * 1024
          if (text.length > MAX_RESPONSE_SIZE) {
            throw new Error(`Response too large: ${text.length} bytes exceeds ${MAX_RESPONSE_SIZE} byte limit`)
          }

          let data: unknown

          try {
            data = JSON.parse(text)
          } catch {
            throw new Error(`Invalid JSON response from ${endpoint}`)
          }

          return {
            url: fullUrl,
            statusCode: 200,
            data: normalizeResponse(data as RawStatsResponse),
            raw: data,
          }
        } finally {
          await client.close()
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // If we have more tiers to try, continue
      if (tiers.indexOf(tier) < tiers.length - 1) {
        continue
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${endpoint}`)
}

/**
 * Fetch data from NBA Live API.
 */
export async function fetchLive(
  endpoint: string,
  options: {
    timeout?: number
    gameId?: string
    headers?: Record<string, string>
  } = {}
): Promise<NbaResponse> {
  const { timeout = DEFAULTS.TIMEOUT, gameId, headers = LIVE_HEADERS } = options

  let path = endpoint
  if (gameId) {
    path = path.replace('{game_id}', gameId)
  }

  const fullUrl = `${LIVE_BASE_URL}/${path}`

  const client = createFetchClient(headers)
  const response = await client.get(fullUrl, { timeout })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const text = await response.text()
  let data: unknown

  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON response from ${endpoint}`)
  }

  return {
    url: fullUrl,
    statusCode: response.status,
    data,
    raw: data,
  }
}

// =============================================================================
// Response Normalization
// =============================================================================

/**
 * Normalize NBA Stats API response from tabular format to named object arrays.
 * Converts resultSets with headers/rowSet to arrays of objects with named properties.
 */
export function normalizeResponse(raw: RawStatsResponse): NormalizedResponse {
  const normalized: NormalizedResponse = {}

  // Handle resultSets (array of result sets)
  if (raw.resultSets && Array.isArray(raw.resultSets)) {
    for (const resultSet of raw.resultSets) {
      normalized[resultSet.name] = normalizeResultSet(resultSet)
    }
    return normalized
  }

  // Handle resultSet (single result set or array)
  if (raw.resultSet) {
    const resultSets = Array.isArray(raw.resultSet) ? raw.resultSet : [raw.resultSet]
    for (const resultSet of resultSets) {
      normalized[resultSet.name] = normalizeResultSet(resultSet)
    }
    return normalized
  }

  // Return as-is if not in expected format
  return normalized
}

/**
 * Convert a single result set with headers and rowSet to array of objects.
 */
function normalizeResultSet(resultSet: RawResultSet): Record<string, unknown>[] {
  const { headers, rowSet } = resultSet
  const rows: Record<string, unknown>[] = []

  for (const row of rowSet) {
    const obj: Record<string, unknown> = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]
      if (header) {
        obj[header] = row[i]
      }
    }
    rows.push(obj)
  }

  return rows
}

/**
 * Convert column name from NBA's UPPER_SNAKE_CASE to camelCase.
 */
export function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

// =============================================================================
// Type-level Key Conversion
// =============================================================================

/**
 * Lowercase a string type.
 * "ABC" -> "abc"
 */
type Lowercase<S extends string> = S extends `${infer C}${infer Rest}`
  ? `${C extends Uppercase<C> ? LowercaseChar<C> : C}${Lowercase<Rest>}`
  : S

type LowercaseChar<C extends string> = C extends 'A'
  ? 'a'
  : C extends 'B'
    ? 'b'
    : C extends 'C'
      ? 'c'
      : C extends 'D'
        ? 'd'
        : C extends 'E'
          ? 'e'
          : C extends 'F'
            ? 'f'
            : C extends 'G'
              ? 'g'
              : C extends 'H'
                ? 'h'
                : C extends 'I'
                  ? 'i'
                  : C extends 'J'
                    ? 'j'
                    : C extends 'K'
                      ? 'k'
                      : C extends 'L'
                        ? 'l'
                        : C extends 'M'
                          ? 'm'
                          : C extends 'N'
                            ? 'n'
                            : C extends 'O'
                              ? 'o'
                              : C extends 'P'
                                ? 'p'
                                : C extends 'Q'
                                  ? 'q'
                                  : C extends 'R'
                                    ? 'r'
                                    : C extends 'S'
                                      ? 's'
                                      : C extends 'T'
                                        ? 't'
                                        : C extends 'U'
                                          ? 'u'
                                          : C extends 'V'
                                            ? 'v'
                                            : C extends 'W'
                                              ? 'w'
                                              : C extends 'X'
                                                ? 'x'
                                                : C extends 'Y'
                                                  ? 'y'
                                                  : C extends 'Z'
                                                    ? 'z'
                                                    : C

/**
 * Uppercase the first character of a string type.
 * "abc" -> "Abc"
 */
type UppercaseFirst<S extends string> = S extends `${infer C}${infer Rest}`
  ? `${Uppercase<C>}${Rest}`
  : S

/**
 * Convert UPPER_SNAKE_CASE to camelCase at the type level.
 * "PLAYER_ID" -> "playerId"
 * "TEAM_ABBREVIATION" -> "teamAbbreviation"
 */
type SnakeToCamel<S extends string> = S extends `${infer First}_${infer Rest}`
  ? `${Lowercase<First>}${SnakeToCamelRest<Rest>}`
  : Lowercase<S>

type SnakeToCamelRest<S extends string> = S extends `${infer First}_${infer Rest}`
  ? `${UppercaseFirst<Lowercase<First>>}${SnakeToCamelRest<Rest>}`
  : UppercaseFirst<Lowercase<S>>

/**
 * Convert all keys in an object from UPPER_SNAKE_CASE to camelCase.
 */
export type NormalizedKeys<T> = {
  [K in keyof T as K extends string ? SnakeToCamel<K> : K]: T[K]
}

/**
 * Convert an object's keys from UPPER_SNAKE_CASE to camelCase.
 * Preserves the type structure with camelCase keys.
 */
export function normalizeKeys<T extends Record<string, unknown>>(obj: T): NormalizedKeys<T> {
  const normalized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    normalized[toCamelCase(key)] = value
  }
  return normalized as NormalizedKeys<T>
}

// =============================================================================
// File I/O
// =============================================================================

/**
 * Write data to a file with automatic directory creation.
 * @param data - Data to write
 * @param filepath - Output file path
 * @param format - Output format ('json' or 'csv', auto-detected from extension if not specified)
 */
export function writeToFile(
  data: unknown,
  filepath: string,
  format?: 'json' | 'csv' | 'auto'
): void {
  const dir = path.dirname(filepath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const detectedFormat =
    format === 'auto' || !format
      ? filepath.endsWith('.csv')
        ? 'csv'
        : 'json'
      : format

  if (detectedFormat === 'csv') {
    const csvContent = toCSV(data)
    fs.writeFileSync(filepath, csvContent, 'utf-8')
  } else {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
  }
}

/**
 * Read data from a JSON file.
 * @param filepath - Path to the file to read
 * @returns Parsed JSON data, or raw string if JSON parsing fails
 * @throws Error if file does not exist
 */
export function readFromFile(filepath: string): unknown {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`)
  }

  const content = fs.readFileSync(filepath, 'utf-8')

  try {
    return JSON.parse(content)
  } catch {
    return content
  }
}

/**
 * Convert data to CSV format.
 */
function toCSV(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return ''
  }

  const firstItem = data[0]
  if (typeof firstItem !== 'object' || firstItem === null) {
    return ''
  }

  const headers = Object.keys(firstItem as Record<string, unknown>)
  const lines: string[] = [headers.join(',')]

  for (const item of data) {
    if (typeof item === 'object' && item !== null) {
      const values = headers.map((header) => {
        const value = (item as Record<string, unknown>)[header]
        if (value === null || value === undefined) {
          return ''
        }
        let strValue = String(value)

        // CSV injection prevention: prefix formula trigger characters with single quote
        // This prevents malicious formulas from executing when opened in spreadsheet apps
        const formulaTriggers = /^[=+\-@\t\r]/
        if (formulaTriggers.test(strValue)) {
          strValue = `'${strValue}`
        }

        // Escape values containing commas, quotes, or newlines
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`
        }
        return strValue
      })
      lines.push(values.join(','))
    }
  }

  return lines.join('\n')
}

// =============================================================================
// Rate Limiting
// =============================================================================

/**
 * Pause execution for a specified duration.
 * @param ms - Milliseconds to pause
 */
export function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a random delay value between min and max.
 * @param min - Minimum milliseconds (default: 1000)
 * @param max - Maximum milliseconds (default: 3000)
 */
export function randomDelay(
  min: number = DEFAULTS.RATE_LIMIT_MIN_MS,
  max: number = DEFAULTS.RATE_LIMIT_MAX_MS
): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Pause execution for a random duration.
 * @param min - Minimum milliseconds (default: 1000)
 * @param max - Maximum milliseconds (default: 3000)
 */
export async function randomPause(
  min: number = DEFAULTS.RATE_LIMIT_MIN_MS,
  max: number = DEFAULTS.RATE_LIMIT_MAX_MS
): Promise<void> {
  const delay = randomDelay(min, max)
  await pause(delay)
}

// =============================================================================
// Logging
// =============================================================================

import winston from 'winston'
import type { LogLevel } from './types.js'

/**
 * Create a Winston logger instance with formatted output.
 * @param level - Log level: 'DEBUG', 'INFO', 'WARNING', 'ERROR', or 'NONE'
 * @returns Configured Winston logger instance
 */
export function createLogger(level: LogLevel = 'INFO'): winston.Logger {
  const winstonLevel =
    level === 'NONE'
      ? 'error'
      : level === 'WARNING'
        ? 'warn'
        : level.toLowerCase()

  return winston.createLogger({
    level: winstonLevel,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`
      })
    ),
    transports: [new winston.transports.Console()],
    silent: level === 'NONE',
  })
}

// =============================================================================
// V3 Box Score Normalization
// =============================================================================

/**
 * Normalize V3 box score player data to match expected schema format.
 * V3 uses different field names: personId -> playerId, firstName+familyName -> playerName, etc.
 */
export function normalizeV3PlayerStats(
  player: Record<string, unknown>,
  team: Record<string, unknown>
): Record<string, unknown> {
  const stats = (player['statistics'] ?? {}) as Record<string, unknown>

  return {
    // Player identification
    playerId: player['personId'],
    playerName: `${player['firstName'] ?? ''} ${player['familyName'] ?? ''}`.trim(),
    playerNameI: player['nameI'],
    jerseyNum: player['jerseyNum'],
    position: player['position'],
    startPosition: player['position'],
    comment: player['comment'],

    // Team info
    teamId: team['teamId'],
    teamCity: team['teamCity'],
    teamName: team['teamName'],
    teamAbbreviation: team['teamTricode'],

    // Statistics (remap V3 names to expected names)
    minutes: stats['minutes'],
    fieldGoalsMade: stats['fieldGoalsMade'],
    fieldGoalsAttempted: stats['fieldGoalsAttempted'],
    fieldGoalPct: stats['fieldGoalsPercentage'],
    threePointersMade: stats['threePointersMade'],
    threePointersAttempted: stats['threePointersAttempted'],
    threePointPct: stats['threePointersPercentage'],
    freeThrowsMade: stats['freeThrowsMade'],
    freeThrowsAttempted: stats['freeThrowsAttempted'],
    freeThrowPct: stats['freeThrowsPercentage'],
    offensiveRebounds: stats['reboundsOffensive'],
    defensiveRebounds: stats['reboundsDefensive'],
    rebounds: stats['reboundsTotal'],
    assists: stats['assists'],
    steals: stats['steals'],
    blocks: stats['blocks'],
    turnovers: stats['turnovers'],
    personalFouls: stats['foulsPersonal'],
    points: stats['points'],
    plusMinus: stats['plusMinusPoints'],
  }
}

/**
 * Normalize V3 box score team data to match expected schema format.
 */
export function normalizeV3TeamStats(team: Record<string, unknown>): Record<string, unknown> {
  const stats = (team['statistics'] ?? {}) as Record<string, unknown>

  return {
    // Team identification
    teamId: team['teamId'],
    teamCity: team['teamCity'],
    teamName: team['teamName'],
    teamAbbreviation: team['teamTricode'],
    teamSlug: team['teamSlug'],

    // Statistics (remap V3 names to expected names)
    minutes: stats['minutes'],
    fieldGoalsMade: stats['fieldGoalsMade'],
    fieldGoalsAttempted: stats['fieldGoalsAttempted'],
    fieldGoalPct: stats['fieldGoalsPercentage'],
    threePointersMade: stats['threePointersMade'],
    threePointersAttempted: stats['threePointersAttempted'],
    threePointPct: stats['threePointersPercentage'],
    freeThrowsMade: stats['freeThrowsMade'],
    freeThrowsAttempted: stats['freeThrowsAttempted'],
    freeThrowPct: stats['freeThrowsPercentage'],
    offensiveRebounds: stats['reboundsOffensive'],
    defensiveRebounds: stats['reboundsDefensive'],
    rebounds: stats['reboundsTotal'],
    assists: stats['assists'],
    steals: stats['steals'],
    blocks: stats['blocks'],
    turnovers: stats['turnovers'],
    personalFouls: stats['foulsPersonal'],
    points: stats['points'],
    plusMinus: stats['plusMinusPoints'],
  }
}

/**
 * Normalize V3 advanced box score player data to match expected schema format.
 * Advanced stats have different fields: offensive/defensive rating, pace, PIE, etc.
 */
export function normalizeV3AdvancedPlayerStats(
  player: Record<string, unknown>,
  team: Record<string, unknown>
): Record<string, unknown> {
  const stats = (player['statistics'] ?? {}) as Record<string, unknown>

  return {
    // Player identification
    playerId: player['personId'],
    playerName: `${player['firstName'] ?? ''} ${player['familyName'] ?? ''}`.trim(),
    playerNameI: player['nameI'],
    jerseyNum: player['jerseyNum'],
    position: player['position'],
    startPosition: player['position'],
    comment: player['comment'],

    // Team info
    teamId: team['teamId'],
    teamCity: team['teamCity'],
    teamName: team['teamName'],
    teamAbbreviation: team['teamTricode'],

    // Advanced statistics
    minutes: stats['minutes'],
    estimatedOffensiveRating: stats['estimatedOffensiveRating'],
    offensiveRating: stats['offensiveRating'],
    estimatedDefensiveRating: stats['estimatedDefensiveRating'],
    defensiveRating: stats['defensiveRating'],
    estimatedNetRating: stats['estimatedNetRating'],
    netRating: stats['netRating'],
    assistPercentage: stats['assistPercentage'],
    assistToTurnover: stats['assistToTurnover'],
    assistRatio: stats['assistRatio'],
    offensiveReboundPercentage: stats['offensiveReboundPercentage'],
    defensiveReboundPercentage: stats['defensiveReboundPercentage'],
    reboundPercentage: stats['reboundPercentage'],
    turnoverRatio: stats['turnoverRatio'],
    effectiveFieldGoalPercentage: stats['effectiveFieldGoalPercentage'],
    trueShootingPercentage: stats['trueShootingPercentage'],
    usagePercentage: stats['usagePercentage'],
    estimatedUsagePercentage: stats['estimatedUsagePercentage'],
    estimatedPace: stats['estimatedPace'],
    pace: stats['pace'],
    pacePer40: stats['pacePer40'],
    possessions: stats['possessions'],
    pie: stats['PIE'],
  }
}

/**
 * Normalize V3 advanced box score team data to match expected schema format.
 */
export function normalizeV3AdvancedTeamStats(team: Record<string, unknown>): Record<string, unknown> {
  const stats = (team['statistics'] ?? {}) as Record<string, unknown>

  return {
    // Team identification
    teamId: team['teamId'],
    teamCity: team['teamCity'],
    teamName: team['teamName'],
    teamAbbreviation: team['teamTricode'],
    teamSlug: team['teamSlug'],

    // Advanced statistics
    minutes: stats['minutes'],
    estimatedOffensiveRating: stats['estimatedOffensiveRating'],
    offensiveRating: stats['offensiveRating'],
    estimatedDefensiveRating: stats['estimatedDefensiveRating'],
    defensiveRating: stats['defensiveRating'],
    estimatedNetRating: stats['estimatedNetRating'],
    netRating: stats['netRating'],
    assistPercentage: stats['assistPercentage'],
    assistToTurnover: stats['assistToTurnover'],
    assistRatio: stats['assistRatio'],
    offensiveReboundPercentage: stats['offensiveReboundPercentage'],
    defensiveReboundPercentage: stats['defensiveReboundPercentage'],
    reboundPercentage: stats['reboundPercentage'],
    estimatedTeamTurnoverPercentage: stats['estimatedTeamTurnoverPercentage'],
    turnoverRatio: stats['turnoverRatio'],
    effectiveFieldGoalPercentage: stats['effectiveFieldGoalPercentage'],
    trueShootingPercentage: stats['trueShootingPercentage'],
    usagePercentage: stats['usagePercentage'],
    estimatedUsagePercentage: stats['estimatedUsagePercentage'],
    estimatedPace: stats['estimatedPace'],
    pace: stats['pace'],
    pacePer40: stats['pacePer40'],
    possessions: stats['possessions'],
    pie: stats['PIE'],
  }
}

// =============================================================================
// Progress Reporter (for CLI)
// =============================================================================

/**
 * Options for the ProgressReporter class.
 */
export interface ProgressReporterOptions {
  /** Output progress as JSON instead of human-readable format */
  json?: boolean
  /** Suppress all output */
  quiet?: boolean
}

/**
 * CLI progress reporter for displaying fetch operations status.
 * Supports both human-readable and JSON output formats.
 *
 * @example
 * ```typescript
 * const reporter = new ProgressReporter({ quiet: false })
 * reporter.logHeader('Fetching Data')
 * reporter.logFetch('leagueLeaders', { season: '2024-25' })
 * reporter.logSuccess('leagueLeaders', '/path/to/file.json')
 * ```
 */
export class ProgressReporter {
  private json: boolean
  private quiet: boolean

  constructor(options: ProgressReporterOptions = {}) {
    this.json = options.json ?? false
    this.quiet = options.quiet ?? false
  }

  logFetch(endpoint: string, params?: Record<string, unknown>): void {
    if (this.quiet) return

    if (this.json) {
      console.log(JSON.stringify({ event: 'fetch', endpoint, params }))
    } else {
      const paramStr = params ? ` (${JSON.stringify(params)})` : ''
      console.log(`Fetching: ${endpoint}${paramStr}`)
    }
  }

  logSuccess(endpoint: string, filepath?: string): void {
    if (this.quiet) return

    if (this.json) {
      console.log(JSON.stringify({ event: 'success', endpoint, filepath }))
    } else {
      const pathStr = filepath ? ` -> ${filepath}` : ''
      console.log(`  ✓ ${endpoint}${pathStr}`)
    }
  }

  logError(endpoint: string, error: string): void {
    if (this.json) {
      console.log(JSON.stringify({ event: 'error', endpoint, error }))
    } else {
      console.error(`  ✗ ${endpoint}: ${error}`)
    }
  }

  logSkip(endpoint: string, reason: string): void {
    if (this.quiet) return

    if (this.json) {
      console.log(JSON.stringify({ event: 'skip', endpoint, reason }))
    } else {
      console.log(`  - ${endpoint}: ${reason}`)
    }
  }

  logInfo(message: string): void {
    if (this.quiet) return

    if (this.json) {
      console.log(JSON.stringify({ event: 'info', message }))
    } else {
      console.log(message)
    }
  }

  logHeader(title: string): void {
    if (this.quiet) return

    if (!this.json) {
      console.log(`\n=== ${title} ===\n`)
    }
  }

  logProgress(current: number, total: number, description: string): void {
    if (this.quiet) return

    if (this.json) {
      console.log(JSON.stringify({ event: 'progress', current, total, description }))
    } else {
      console.log(`[${current}/${total}] ${description}`)
    }
  }
}
