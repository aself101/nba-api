/**
 * NBA API Configuration
 *
 * Constants, endpoints, parameter enums, and validation functions.
 */

// =============================================================================
// Base URLs
// =============================================================================

export const STATS_BASE_URL = 'https://stats.nba.com/stats'
export const LIVE_BASE_URL = 'https://cdn.nba.com/static/json/liveData'

// =============================================================================
// HTTP Headers
// =============================================================================

export const STATS_HEADERS: Record<string, string> = {
  Host: 'stats.nba.com',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  Referer: 'https://stats.nba.com/',
  Origin: 'https://stats.nba.com',
  'Sec-Ch-Ua': '"Chromium";v="131", "Google Chrome";v="131", "Not;A=Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache',
}

export const LIVE_HEADERS: Record<string, string> = {
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'max-age=0',
  Connection: 'keep-alive',
  Host: 'cdn.nba.com',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
}

// =============================================================================
// Stats API Endpoints
// =============================================================================

export const ENDPOINTS = {
  // Player endpoints
  PLAYER_CAREER_STATS: 'playercareerstats',
  PLAYER_GAME_LOG: 'playergamelog',
  COMMON_PLAYER_INFO: 'commonplayerinfo',
  COMMON_ALL_PLAYERS: 'commonallplayers',
  PLAYER_ESTIMATED_METRICS: 'playerestimatedmetrics',

  // Team endpoints
  COMMON_TEAM_ROSTER: 'commonteamroster',
  TEAM_GAME_LOG: 'teamgamelog',
  TEAM_INFO_COMMON: 'teaminfocommon',
  TEAM_YEAR_BY_YEAR_STATS: 'teamyearbyyearstats',

  // League-wide endpoints
  LEAGUE_LEADERS: 'leagueleaders',
  LEAGUE_DASH_PLAYER_STATS: 'leaguedashplayerstats',
  LEAGUE_STANDINGS: 'leaguestandingsv3',
  LEAGUE_GAME_FINDER: 'leaguegamefinder',
  LEAGUE_GAME_LOG: 'leaguegamelog',

  // Game endpoints
  SCOREBOARD: 'scoreboardv3',
  BOX_SCORE_TRADITIONAL: 'boxscoretraditionalv3',
  BOX_SCORE_ADVANCED: 'boxscoreadvancedv3',
  PLAY_BY_PLAY: 'playbyplayv3',

  // Other endpoints
  SHOT_CHART_DETAIL: 'shotchartdetail',
  DRAFT_HISTORY: 'drafthistory',

  // Live API endpoints
  LIVE_SCOREBOARD: 'scoreboard/todaysScoreboard_00.json',
  LIVE_BOXSCORE: 'boxscore/boxscore_{game_id}.json',
  LIVE_PLAYBYPLAY: 'playbyplay/playbyplay_{game_id}.json',
  LIVE_ODDS: 'odds/odds_todaysGames.json',
} as const

export type EndpointKey = keyof typeof ENDPOINTS

// =============================================================================
// Parameter Constants
// =============================================================================

export const SeasonType = {
  REGULAR: 'Regular Season',
  PLAYOFFS: 'Playoffs',
  PRESEASON: 'Pre Season',
  PLAYIN: 'PlayIn',
  ALL_STAR: 'All Star',
} as const

export type SeasonTypeValue = (typeof SeasonType)[keyof typeof SeasonType]

export const PerMode = {
  TOTALS: 'Totals',
  PER_GAME: 'PerGame',
  PER_36: 'Per36',
  PER_48: 'Per48',
  PER_MINUTE: 'PerMinute',
  PER_POSSESSION: 'PerPossession',
  PER_PLAY: 'PerPlay',
  PER_100_POSSESSIONS: 'Per100Possessions',
  PER_100_PLAYS: 'Per100Plays',
} as const

export type PerModeValue = (typeof PerMode)[keyof typeof PerMode]

export const MeasureType = {
  BASE: 'Base',
  ADVANCED: 'Advanced',
  MISC: 'Misc',
  SCORING: 'Scoring',
  USAGE: 'Usage',
  OPPONENT: 'Opponent',
  FOUR_FACTORS: 'Four Factors',
  DEFENSE: 'Defense',
} as const

export type MeasureTypeValue = (typeof MeasureType)[keyof typeof MeasureType]

export const LeagueID = {
  NBA: '00',
  ABA: '01',
  WNBA: '10',
  SUMMER_LEAGUE: '15',
  G_LEAGUE: '20',
} as const

export type LeagueIDValue = (typeof LeagueID)[keyof typeof LeagueID]

export const Conference = {
  EAST: 'East',
  WEST: 'West',
} as const

export type ConferenceValue = (typeof Conference)[keyof typeof Conference]

export const Division = {
  ATLANTIC: 'Atlantic',
  CENTRAL: 'Central',
  SOUTHEAST: 'Southeast',
  NORTHWEST: 'Northwest',
  PACIFIC: 'Pacific',
  SOUTHWEST: 'Southwest',
} as const

export type DivisionValue = (typeof Division)[keyof typeof Division]

export const Outcome = {
  WIN: 'W',
  LOSS: 'L',
} as const

export type OutcomeValue = (typeof Outcome)[keyof typeof Outcome]

export const Location = {
  HOME: 'Home',
  ROAD: 'Road',
} as const

export type LocationValue = (typeof Location)[keyof typeof Location]

export const PlayerPosition = {
  GUARD: 'G',
  FORWARD: 'F',
  CENTER: 'C',
  GUARD_FORWARD: 'G-F',
  FORWARD_GUARD: 'F-G',
  FORWARD_CENTER: 'F-C',
  CENTER_FORWARD: 'C-F',
} as const

export type PlayerPositionValue = (typeof PlayerPosition)[keyof typeof PlayerPosition]

export const StatCategory = {
  POINTS: 'PTS',
  REBOUNDS: 'REB',
  ASSISTS: 'AST',
  STEALS: 'STL',
  BLOCKS: 'BLK',
  FIELD_GOAL_PCT: 'FG_PCT',
  THREE_POINT_PCT: 'FG3_PCT',
  FREE_THROW_PCT: 'FT_PCT',
  EFFICIENCY: 'EFF',
  ASSISTS_TURNOVERS: 'AST_TOV',
  STEALS_TURNOVERS: 'STL_TOV',
} as const

export type StatCategoryValue = (typeof StatCategory)[keyof typeof StatCategory]

export const GameSegment = {
  FIRST_HALF: 'First Half',
  SECOND_HALF: 'Second Half',
  OVERTIME: 'Overtime',
} as const

export type GameSegmentValue = (typeof GameSegment)[keyof typeof GameSegment]

export const ShotClockRange = {
  RANGE_24_22: '24-22',
  RANGE_22_18: '22-18 Very Early',
  RANGE_18_15: '18-15 Early',
  RANGE_15_7: '15-7 Average',
  RANGE_7_4: '7-4 Late',
  RANGE_4_0: '4-0 Very Late',
  SHOT_CLOCK_OFF: 'ShotClock Off',
} as const

export type ShotClockRangeValue = (typeof ShotClockRange)[keyof typeof ShotClockRange]

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULTS = {
  TIMEOUT: 30000,
  LEAGUE_ID: LeagueID.NBA,
  PER_MODE: PerMode.TOTALS,
  SEASON_TYPE: SeasonType.REGULAR,
  OUTPUT_DIR: 'datasets',
  RATE_LIMIT_MIN_MS: 1000,
  RATE_LIMIT_MAX_MS: 3000,
} as const

// =============================================================================
// Season Utilities
// =============================================================================

/**
 * Get the current NBA season in "YYYY-YY" format.
 * NBA season starts in October, so if we're before October, use previous year.
 */
export function getCurrentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 0-indexed

  // NBA season typically starts in October (month 10)
  // If before October, we're in the previous season
  const seasonStartYear = month >= 10 ? year : year - 1
  const seasonEndYear = seasonStartYear + 1

  return `${seasonStartYear}-${String(seasonEndYear).slice(2)}`
}

/**
 * Get the current season year (start year of the season).
 */
export function getCurrentSeasonYear(): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  return month >= 10 ? year : year - 1
}

/**
 * Format a year into NBA season format "YYYY-YY".
 * @param year - The starting year of the season (e.g., 2024 for 2024-25)
 */
export function formatSeason(year: number): string {
  const nextYear = year + 1
  return `${year}-${String(nextYear).slice(2)}`
}

/**
 * Parse a season string to get the start year.
 * @param season - Season string in "YYYY-YY" format
 */
export function parseSeasonYear(season: string): number {
  const match = season.match(/^(\d{4})-\d{2}$/)
  if (!match?.[1]) {
    throw new Error(`Invalid season format: ${season}. Expected format: YYYY-YY (e.g., 2024-25)`)
  }
  return parseInt(match[1], 10)
}

/**
 * Validate that a season string is in the correct format.
 * @param season - Season string to validate
 */
export function validateSeason(season: string): void {
  const pattern = /^\d{4}-\d{2}$/
  if (!pattern.test(season)) {
    throw new Error(`Invalid season format: ${season}. Expected format: YYYY-YY (e.g., 2024-25)`)
  }

  const startYear = parseInt(season.slice(0, 4), 10)
  const endYearSuffix = parseInt(season.slice(5), 10)
  const expectedEndSuffix = (startYear + 1) % 100

  if (endYearSuffix !== expectedEndSuffix) {
    throw new Error(
      `Invalid season: ${season}. End year suffix should be ${String(expectedEndSuffix).padStart(2, '0')}`
    )
  }

  // NBA data typically available from 1996-97
  if (startYear < 1946) {
    throw new Error(`Season ${season} is before NBA founding year (1946)`)
  }

  const currentYear = new Date().getFullYear()
  if (startYear > currentYear + 1) {
    throw new Error(`Season ${season} is in the future`)
  }
}

/**
 * Generate an array of season strings for a year range.
 * @param startYear - Start year (inclusive)
 * @param endYear - End year (inclusive)
 */
export function generateSeasonRange(startYear: number, endYear: number): string[] {
  if (startYear > endYear) {
    throw new Error(`Start year (${startYear}) cannot be greater than end year (${endYear})`)
  }

  const seasons: string[] = []
  for (let year = startYear; year <= endYear; year++) {
    seasons.push(formatSeason(year))
  }
  return seasons
}

// =============================================================================
// URL Building
// =============================================================================

/**
 * Build a full URL for a stats API endpoint with query parameters.
 * @param endpoint - The endpoint name (from ENDPOINTS)
 * @param params - Query parameters
 */
export function buildStatsUrl(
  endpoint: string,
  params: Record<string, string | number | boolean | null | undefined> = {}
): string {
  const url = new URL(`${STATS_BASE_URL}/${endpoint}`)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value))
    }
  }

  // Sort parameters alphabetically (NBA API can be sensitive to parameter order)
  const sortedParams = new URLSearchParams(
    [...url.searchParams.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  )

  return `${STATS_BASE_URL}/${endpoint}?${sortedParams.toString()}`
}

/**
 * Build a full URL for a live API endpoint.
 * @param endpoint - The endpoint path
 * @param gameId - Optional game ID for endpoints that require it
 */
export function buildLiveUrl(endpoint: string, gameId?: string): string {
  let path = endpoint
  if (gameId) {
    path = path.replace('{game_id}', gameId)
  }
  return `${LIVE_BASE_URL}/${path}`
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate that a player ID is a positive integer.
 */
export function validatePlayerId(playerId: number): void {
  if (!Number.isInteger(playerId) || playerId <= 0) {
    throw new Error(`Invalid player ID: ${playerId}. Must be a positive integer.`)
  }
}

/**
 * Validate that a team ID is a positive integer.
 */
export function validateTeamId(teamId: number): void {
  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new Error(`Invalid team ID: ${teamId}. Must be a positive integer.`)
  }
}

/**
 * Validate that a game ID is in the correct format.
 * NBA game IDs are typically 10 digits (e.g., "0022400001")
 */
export function validateGameId(gameId: string): void {
  const pattern = /^\d{10}$/
  if (!pattern.test(gameId)) {
    throw new Error(
      `Invalid game ID: ${gameId}. Must be a 10-digit string (e.g., "0022400001").`
    )
  }
}

/**
 * Validate that a date is in YYYY-MM-DD format.
 */
export function validateDate(date: string): void {
  const pattern = /^\d{4}-\d{2}-\d{2}$/
  if (!pattern.test(date)) {
    throw new Error(`Invalid date format: ${date}. Expected format: YYYY-MM-DD`)
  }

  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${date}`)
  }
}

/**
 * Validate that a value is one of the allowed options.
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  paramName: string
): void {
  if (!allowedValues.includes(value as T)) {
    throw new Error(
      `Invalid ${paramName}: "${value}". Allowed values: ${allowedValues.join(', ')}`
    )
  }
}

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Get today's date in YYYY-MM-DD format.
 */
export function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get the NBA season start date (typically late October).
 * @param seasonYear - The starting year of the season
 */
export function getSeasonStartDate(seasonYear: number): string {
  // NBA season typically starts around October 22-24
  return `${seasonYear}-10-22`
}

/**
 * Get the NBA season end date (typically mid-April for regular season).
 * @param seasonYear - The starting year of the season
 */
export function getSeasonEndDate(seasonYear: number): string {
  // Regular season typically ends around April 14
  return `${seasonYear + 1}-04-14`
}
