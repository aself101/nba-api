/**
 * NBA API - Main API Class
 *
 * TypeScript wrapper for NBA Stats and Live APIs.
 */

import type { Logger } from 'winston'

import {
  ENDPOINTS,
  DEFAULTS,
  SeasonType,
  PerMode,
  LeagueID,
  getCurrentSeason,
  validateSeason,
  validatePlayerId,
  validateTeamId,
  validateGameId,
  validateDate,
} from './config.js'
import {
  fetchStats,
  fetchLive,
  createLogger,
  createPuppeteerClient,
  normalizeKeys,
  normalizeV3PlayerStats,
  normalizeV3TeamStats,
  normalizeV3AdvancedPlayerStats,
  normalizeV3AdvancedTeamStats,
} from './utils.js'
import { teams, findTeamById, findTeamByAbbreviation, findTeamsByName } from './data/teams.js'
import {
  players,
  findPlayerById,
  findPlayersByName,
  getActivePlayers,
  getInactivePlayers,
} from './data/players.js'
import type {
  NbaAPIOptions,
  ClientTier,
  Player,
  Team,
  NormalizedResponse,
  PlayerCareerStats,
  PlayerGameLog,
  CommonPlayerInfo,
  PlayerSummary,
  PlayerEstimatedMetrics,
  TeamRoster,
  TeamGameLog,
  TeamInfoCommon,
  TeamYearByYearStats,
  LeagueLeader,
  LeagueDashPlayerStats,
  LeagueStanding,
  GameFinderResult,
  LeagueGameLogEntry,
  Scoreboard,
  BoxScoreTraditional,
  BoxScoreAdvanced,
  PlayByPlayAction,
  ShotChartShot,
  DraftHistoryEntry,
  LiveScoreboard,
  LiveBoxScore,
  LivePlayByPlay,
  LiveOdds,
  PlayerCareerOptions,
  LeagueDashOptions,
  GameFinderOptions,
  ShotChartOptions,
} from './types.js'
import {
  PlayerCareerStatsSchema,
  PlayerGameLogSchema,
  CommonPlayerInfoSchema,
  PlayerSummarySchema,
  PlayerEstimatedMetricsSchema,
  TeamRosterSchema,
  TeamGameLogSchema,
  TeamInfoCommonSchema,
  TeamYearByYearStatsSchema,
  LeagueLeaderSchema,
  LeagueDashPlayerStatsSchema,
  LeagueStandingSchema,
  GameFinderResultSchema,
  LeagueGameLogEntrySchema,
  BoxScorePlayerStatsSchema,
  BoxScoreTeamStatsSchema,
  DraftHistoryEntrySchema,
  parseArraySafe,
} from './schemas.js'

// Re-export types and data for convenience
export * from './types.js'
export * from './config.js'
export {
  teams,
  findTeamById,
  findTeamByAbbreviation,
  findTeamsByName,
  findTeamsByCity,
  findTeamsByState,
} from './data/teams.js'
export {
  players,
  findPlayerById,
  findPlayersByName,
  getActivePlayers,
  getInactivePlayers,
} from './data/players.js'

/**
 * NBA API Client
 *
 * Provides access to NBA Stats API and Live API endpoints.
 *
 * @example
 * ```typescript
 * const api = new NbaAPI()
 * await api.connect()
 *
 * // Get player career stats
 * const stats = await api.getPlayerCareerStats(2544) // LeBron James
 *
 * // Get live scoreboard
 * const scoreboard = await api.getLiveScoreboard()
 *
 * await api.close()
 * ```
 */
export class NbaAPI {
  private logger: Logger
  private timeout: number
  private clientTier: ClientTier
  private isConnected: boolean = false
  private puppeteerClient: Awaited<ReturnType<typeof createPuppeteerClient>> | null = null

  constructor(options: NbaAPIOptions = {}) {
    const {
      logLevel = 'INFO',
      timeout = DEFAULTS.TIMEOUT,
      clientTier = 'tier1',
    } = options

    this.logger = createLogger(logLevel)
    this.timeout = timeout
    this.clientTier = clientTier
  }

  // ===========================================================================
  // Connection Management
  // ===========================================================================

  /**
   * Initialize the API client.
   * For tier2 or auto mode, this pre-initializes the Puppeteer browser.
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.warn('Already connected')
      return
    }

    this.logger.info(`Initializing NBA API client (tier: ${this.clientTier})`)

    // Pre-initialize puppeteer if needed
    if (this.clientTier === 'tier2') {
      this.logger.debug('Initializing Puppeteer client...')
      this.puppeteerClient = await createPuppeteerClient()
    }

    this.isConnected = true
    this.logger.info('NBA API client initialized')
  }

  /**
   * Close the API client and cleanup resources.
   */
  async close(): Promise<void> {
    if (this.puppeteerClient) {
      this.logger.debug('Closing Puppeteer client...')
      await this.puppeteerClient.close()
      this.puppeteerClient = null
    }
    this.isConnected = false
    this.logger.info('NBA API client closed')
  }

  /**
   * Check if the client is connected.
   */
  get connected(): boolean {
    return this.isConnected
  }

  // ===========================================================================
  // Internal Helpers
  // ===========================================================================

  // Overload signatures for proper type inference
  private async _fetchStats(
    endpoint: string,
    params: Record<string, string | number | boolean | null | undefined>,
    options: { returnRaw: true }
  ): Promise<unknown>
  private async _fetchStats(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>,
    options?: { returnRaw?: false }
  ): Promise<NormalizedResponse>
  private async _fetchStats(
    endpoint: string,
    params: Record<string, string | number | boolean | null | undefined> = {},
    options: { returnRaw?: boolean } = {}
  ): Promise<NormalizedResponse | unknown> {
    this.logger.debug(`Fetching ${endpoint} with params: ${JSON.stringify(params)}`)

    const response = await fetchStats(endpoint, params, {
      timeout: this.timeout,
      clientTier: this.clientTier,
    })

    // Return raw response for endpoints with non-standard format (e.g., scoreboardv3)
    if (options.returnRaw) {
      return response.raw
    }

    return response.data as NormalizedResponse
  }

  private async _fetchLive(endpoint: string, gameId?: string): Promise<unknown> {
    this.logger.debug(`Fetching live ${endpoint}`)

    const options: { timeout: number; gameId?: string } = {
      timeout: this.timeout,
    }
    if (gameId !== undefined) {
      options.gameId = gameId
    }

    const response = await fetchLive(endpoint, options)

    return response.data
  }

  // ===========================================================================
  // Player Endpoints
  // ===========================================================================

  /**
   * Get player career statistics.
   * @param playerId - NBA player ID
   * @param options - Optional parameters (perMode, leagueId)
   */
  async getPlayerCareerStats(
    playerId: number,
    options: PlayerCareerOptions = {}
  ): Promise<PlayerCareerStats[]> {
    validatePlayerId(playerId)

    const { perMode = PerMode.TOTALS, leagueId = LeagueID.NBA } = options

    const data = await this._fetchStats(ENDPOINTS.PLAYER_CAREER_STATS, {
      PlayerID: playerId,
      PerMode: perMode,
      LeagueID: leagueId,
    })

    const resultSet = data['SeasonTotalsRegularSeason'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(PlayerCareerStatsSchema, normalized) as PlayerCareerStats[]
  }

  /**
   * Get player game log for a season.
   * @param playerId - NBA player ID
   * @param season - Season in "YYYY-YY" format (default: current)
   * @param seasonType - Season type (default: Regular Season)
   */
  async getPlayerGameLog(
    playerId: number,
    season?: string,
    seasonType: string = SeasonType.REGULAR
  ): Promise<PlayerGameLog[]> {
    validatePlayerId(playerId)
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.PLAYER_GAME_LOG, {
      PlayerID: playerId,
      Season: resolvedSeason,
      SeasonType: seasonType,
      LeagueID: LeagueID.NBA,
    })

    const resultSet = data['PlayerGameLog'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(PlayerGameLogSchema, normalized) as PlayerGameLog[]
  }

  /**
   * Get common player information (bio, draft info, etc.).
   * @param playerId - NBA player ID
   */
  async getCommonPlayerInfo(playerId: number): Promise<CommonPlayerInfo> {
    validatePlayerId(playerId)

    const data = await this._fetchStats(ENDPOINTS.COMMON_PLAYER_INFO, {
      PlayerID: playerId,
      LeagueID: LeagueID.NBA,
    })

    const resultSet = data['CommonPlayerInfo'] ?? []
    if (resultSet.length === 0) {
      throw new Error(`Player not found: ${playerId}`)
    }
    const normalized = normalizeKeys(resultSet[0] as Record<string, unknown>)
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    const validated = parseArraySafe(CommonPlayerInfoSchema, [normalized])
    return validated[0] as CommonPlayerInfo
  }

  /**
   * Get list of all players.
   * @param season - Season in "YYYY-YY" format (default: current)
   * @param isOnlyCurrentSeason - Only return players from specified season
   */
  async getCommonAllPlayers(
    season?: string,
    isOnlyCurrentSeason: boolean = false
  ): Promise<PlayerSummary[]> {
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.COMMON_ALL_PLAYERS, {
      Season: resolvedSeason,
      LeagueID: LeagueID.NBA,
      IsOnlyCurrentSeason: isOnlyCurrentSeason ? 1 : 0,
    })

    const resultSet = data['CommonAllPlayers'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(PlayerSummarySchema, normalized) as PlayerSummary[]
  }

  /**
   * Get player estimated metrics (advanced stats).
   * @param season - Season in "YYYY-YY" format (default: current)
   */
  async getPlayerEstimatedMetrics(season?: string): Promise<PlayerEstimatedMetrics[]> {
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.PLAYER_ESTIMATED_METRICS, {
      Season: resolvedSeason,
      LeagueID: LeagueID.NBA,
      SeasonType: SeasonType.REGULAR,
    })

    const resultSet = data['PlayerEstimatedMetrics'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(PlayerEstimatedMetricsSchema, normalized) as PlayerEstimatedMetrics[]
  }

  // ===========================================================================
  // Team Endpoints
  // ===========================================================================

  /**
   * Get team roster.
   * @param teamId - NBA team ID
   * @param season - Season in "YYYY-YY" format (default: current)
   */
  async getCommonTeamRoster(teamId: number, season?: string): Promise<TeamRoster[]> {
    validateTeamId(teamId)
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.COMMON_TEAM_ROSTER, {
      TeamID: teamId,
      Season: resolvedSeason,
      LeagueID: LeagueID.NBA,
    })

    const resultSet = data['CommonTeamRoster'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(TeamRosterSchema, normalized) as TeamRoster[]
  }

  /**
   * Get team game log for a season.
   * @param teamId - NBA team ID
   * @param season - Season in "YYYY-YY" format (default: current)
   * @param seasonType - Season type (default: Regular Season)
   */
  async getTeamGameLog(
    teamId: number,
    season?: string,
    seasonType: string = SeasonType.REGULAR
  ): Promise<TeamGameLog[]> {
    validateTeamId(teamId)
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.TEAM_GAME_LOG, {
      TeamID: teamId,
      Season: resolvedSeason,
      SeasonType: seasonType,
      LeagueID: LeagueID.NBA,
    })

    const resultSet = data['TeamGameLog'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(TeamGameLogSchema, normalized) as TeamGameLog[]
  }

  /**
   * Get common team information.
   * @param teamId - NBA team ID
   * @param season - Season in "YYYY-YY" format (default: current)
   */
  async getTeamInfoCommon(teamId: number, season?: string): Promise<TeamInfoCommon> {
    validateTeamId(teamId)
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.TEAM_INFO_COMMON, {
      TeamID: teamId,
      Season: resolvedSeason,
      LeagueID: LeagueID.NBA,
    })

    const resultSet = data['TeamInfoCommon'] ?? []
    if (resultSet.length === 0) {
      throw new Error(`Team not found: ${teamId}`)
    }
    const normalized = normalizeKeys(resultSet[0] as Record<string, unknown>)
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    const validated = parseArraySafe(TeamInfoCommonSchema, [normalized])
    return validated[0] as TeamInfoCommon
  }

  /**
   * Get team year-by-year statistics.
   * @param teamId - NBA team ID
   */
  async getTeamYearByYearStats(teamId: number): Promise<TeamYearByYearStats[]> {
    validateTeamId(teamId)

    const data = await this._fetchStats(ENDPOINTS.TEAM_YEAR_BY_YEAR_STATS, {
      TeamID: teamId,
      LeagueID: LeagueID.NBA,
      SeasonType: SeasonType.REGULAR,
      PerMode: PerMode.TOTALS,
    })

    const resultSet = data['TeamStats'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(TeamYearByYearStatsSchema, normalized) as TeamYearByYearStats[]
  }

  // ===========================================================================
  // League-Wide Endpoints
  // ===========================================================================

  /**
   * Get league leaders by stat category.
   * @param season - Season in "YYYY-YY" format (default: current)
   * @param statCategory - Stat category (PTS, REB, AST, etc.)
   */
  async getLeagueLeaders(
    season?: string,
    statCategory: string = 'PTS'
  ): Promise<LeagueLeader[]> {
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.LEAGUE_LEADERS, {
      Season: resolvedSeason,
      SeasonType: SeasonType.REGULAR,
      LeagueID: LeagueID.NBA,
      StatCategory: statCategory,
      PerMode: PerMode.PER_GAME,
      Scope: 'S',
    })

    const resultSet = data['LeagueLeaders'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(LeagueLeaderSchema, normalized) as LeagueLeader[]
  }

  /**
   * Get league dashboard player stats.
   * @param options - Filter options
   */
  async getLeagueDashPlayerStats(
    options: LeagueDashOptions = {}
  ): Promise<LeagueDashPlayerStats[]> {
    const {
      perMode = PerMode.TOTALS,
      measureType = 'Base',
      season = getCurrentSeason(),
      seasonType = SeasonType.REGULAR,
      conference,
      division,
      teamId,
      outcome,
      location,
      month = 0,
      period = 0,
      lastNGames = 0,
    } = options

    validateSeason(season)

    const data = await this._fetchStats(ENDPOINTS.LEAGUE_DASH_PLAYER_STATS, {
      Season: season,
      SeasonType: seasonType,
      LeagueID: LeagueID.NBA,
      PerMode: perMode,
      MeasureType: measureType,
      Conference: conference ?? '',
      Division: division ?? '',
      TeamID: teamId ?? 0,
      Outcome: outcome ?? '',
      Location: location ?? '',
      Month: month,
      Period: period,
      LastNGames: lastNGames,
      PORound: 0,
      PaceAdjust: 'N',
      PlusMinus: 'N',
      Rank: 'N',
      OpponentTeamID: 0,
      VsConference: '',
      VsDivision: '',
      GameSegment: '',
      DateFrom: '',
      DateTo: '',
      ShotClockRange: '',
      GameScope: '',
      PlayerExperience: '',
      PlayerPosition: '',
      StarterBench: '',
      DraftYear: '',
      DraftPick: '',
      College: '',
      Country: '',
      Height: '',
      Weight: '',
    })

    const resultSet = data['LeagueDashPlayerStats'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(LeagueDashPlayerStatsSchema, normalized) as LeagueDashPlayerStats[]
  }

  /**
   * Get league standings.
   * @param season - Season in "YYYY-YY" format (default: current)
   * @param seasonType - Season type (default: Regular Season)
   */
  async getLeagueStandings(
    season?: string,
    seasonType: string = SeasonType.REGULAR
  ): Promise<LeagueStanding[]> {
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.LEAGUE_STANDINGS, {
      Season: resolvedSeason,
      SeasonType: seasonType,
      LeagueID: LeagueID.NBA,
    })

    const resultSet = data['Standings'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(LeagueStandingSchema, normalized) as unknown as LeagueStanding[]
  }

  /**
   * Search for games matching specific criteria.
   * @param options - Search options
   */
  async getLeagueGameFinder(options: GameFinderOptions = {}): Promise<GameFinderResult[]> {
    const {
      playerOrTeam = 'T',
      season,
      seasonType = SeasonType.REGULAR,
      leagueId = LeagueID.NBA,
      teamId,
      playerId,
      vsTeamId,
      vsConference,
      vsDivision,
      outcome,
      location,
      dateFrom,
      dateTo,
    } = options

    if (dateFrom) validateDate(dateFrom)
    if (dateTo) validateDate(dateTo)

    const data = await this._fetchStats(ENDPOINTS.LEAGUE_GAME_FINDER, {
      PlayerOrTeam: playerOrTeam,
      Season: season ?? '',
      SeasonType: seasonType,
      LeagueID: leagueId,
      TeamID: teamId ?? '',
      PlayerID: playerId ?? '',
      VsTeamID: vsTeamId ?? '',
      VsConference: vsConference ?? '',
      VsDivision: vsDivision ?? '',
      Outcome: outcome ?? '',
      Location: location ?? '',
      DateFrom: dateFrom ?? '',
      DateTo: dateTo ?? '',
      Conference: '',
      Division: '',
      GameSegment: '',
      Period: '',
      ShotClockRange: '',
      LastNGames: '',
      Month: '',
      SeasonSegment: '',
      DraftYear: '',
      DraftPick: '',
      College: '',
      Country: '',
      Height: '',
      Weight: '',
      StarterBench: '',
      PlayerExperience: '',
      PlayerPosition: '',
      EqAST: '',
      EqBLK: '',
      EqDD: '',
      EqDREB: '',
      EqFG3A: '',
      EqFG3M: '',
      EqFG3_PCT: '',
      EqFGA: '',
      EqFGM: '',
      EqFG_PCT: '',
      EqFTA: '',
      EqFTM: '',
      EqFT_PCT: '',
      EqMINUTES: '',
      EqOREB: '',
      EqPF: '',
      EqPTS: '',
      EqREB: '',
      EqSTL: '',
      EqTD: '',
      EqTOV: '',
      GtAST: '',
      GtBLK: '',
      GtDD: '',
      GtDREB: '',
      GtFG3A: '',
      GtFG3M: '',
      GtFG3_PCT: '',
      GtFGA: '',
      GtFGM: '',
      GtFG_PCT: '',
      GtFTA: '',
      GtFTM: '',
      GtFT_PCT: '',
      GtMINUTES: '',
      GtOREB: '',
      GtPF: '',
      GtPTS: '',
      GtREB: '',
      GtSTL: '',
      GtTD: '',
      GtTOV: '',
      LtAST: '',
      LtBLK: '',
      LtDD: '',
      LtDREB: '',
      LtFG3A: '',
      LtFG3M: '',
      LtFG3_PCT: '',
      LtFGA: '',
      LtFGM: '',
      LtFG_PCT: '',
      LtFTA: '',
      LtFTM: '',
      LtFT_PCT: '',
      LtMINUTES: '',
      LtOREB: '',
      LtPF: '',
      LtPTS: '',
      LtREB: '',
      LtSTL: '',
      LtTD: '',
      LtTOV: '',
    })

    const resultSet = data['LeagueGameFinderResults'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(GameFinderResultSchema, normalized) as GameFinderResult[]
  }

  /**
   * Get league game log for a season.
   * @param season - Season in "YYYY-YY" format (default: current)
   * @param seasonType - Season type (default: Regular Season)
   */
  async getLeagueGameLog(
    season?: string,
    seasonType: string = SeasonType.REGULAR
  ): Promise<LeagueGameLogEntry[]> {
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.LEAGUE_GAME_LOG, {
      Season: resolvedSeason,
      SeasonType: seasonType,
      LeagueID: LeagueID.NBA,
      PlayerOrTeam: 'T',
      Direction: 'DESC',
      Sorter: 'DATE',
      Counter: 0,
      DateFrom: '',
      DateTo: '',
    })

    const resultSet = data['LeagueGameLog'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(LeagueGameLogEntrySchema, normalized) as LeagueGameLogEntry[]
  }

  // ===========================================================================
  // Game Endpoints
  // ===========================================================================

  /**
   * Get the scoreboard for a specific date.
   * @param gameDate - Date in YYYY-MM-DD format (default: today)
   */
  async getScoreboard(gameDate?: string): Promise<Scoreboard> {
    if (gameDate) validateDate(gameDate)

    // scoreboardv3 uses non-standard response format, need raw response
    const rawData = (await this._fetchStats(
      ENDPOINTS.SCOREBOARD,
      {
        GameDate: gameDate ?? '',
        LeagueID: LeagueID.NBA,
      },
      { returnRaw: true }
    )) as Record<string, unknown>

    // V3 scoreboard structure: { scoreboard: { games: [...] } }
    const scoreboard = (rawData['scoreboard'] ?? rawData['ScoreBoard'] ?? rawData) as Record<
      string,
      unknown
    >

    return {
      gameDate: gameDate ?? new Date().toISOString().split('T')[0] ?? '',
      leagueId: LeagueID.NBA,
      leagueName: 'National Basketball Association',
      games: (scoreboard['games'] as Scoreboard['games']) ?? [],
    }
  }

  /**
   * Get traditional box score for a game.
   * @param gameId - NBA game ID (10 digits)
   */
  async getBoxScoreTraditional(gameId: string): Promise<BoxScoreTraditional> {
    validateGameId(gameId)

    // boxscoretraditionalv3 uses non-standard response format, need raw response
    const rawData = (await this._fetchStats(
      ENDPOINTS.BOX_SCORE_TRADITIONAL,
      {
        GameID: gameId,
        LeagueID: LeagueID.NBA,
      },
      { returnRaw: true }
    )) as Record<string, unknown>

    // V3 box score structure: { boxScoreTraditional: { homeTeam: { players }, awayTeam: { players } } }
    const boxScore = (rawData['boxScoreTraditional'] ?? {}) as Record<string, unknown>
    const homeTeam = (boxScore['homeTeam'] ?? {}) as Record<string, unknown>
    const awayTeam = (boxScore['awayTeam'] ?? {}) as Record<string, unknown>

    // Extract and normalize player stats from both teams using V3 normalization
    const homePlayers = ((homeTeam['players'] ?? []) as Record<string, unknown>[]).map((p) =>
      normalizeV3PlayerStats(p, homeTeam)
    )
    const awayPlayers = ((awayTeam['players'] ?? []) as Record<string, unknown>[]).map((p) =>
      normalizeV3PlayerStats(p, awayTeam)
    )

    const playerStats = parseArraySafe(BoxScorePlayerStatsSchema, [...homePlayers, ...awayPlayers])

    // Extract and normalize team stats using V3 normalization
    const homeTeamStats = normalizeV3TeamStats(homeTeam)
    const awayTeamStats = normalizeV3TeamStats(awayTeam)
    const teamStats = parseArraySafe(BoxScoreTeamStatsSchema, [homeTeamStats, awayTeamStats])

    return {
      gameId: (boxScore['gameId'] as string) ?? gameId,
      homeTeamId: (boxScore['homeTeamId'] as number) ?? 0,
      awayTeamId: (boxScore['awayTeamId'] as number) ?? 0,
      gameDateEst: (boxScore['gameTimeLocal'] as string) ?? '',
      playerStats,
      teamStats,
    } as unknown as BoxScoreTraditional
  }

  /**
   * Get advanced box score for a game.
   * @param gameId - NBA game ID (10 digits)
   */
  async getBoxScoreAdvanced(gameId: string): Promise<BoxScoreAdvanced> {
    validateGameId(gameId)

    // boxscoreadvancedv3 uses non-standard response format, need raw response
    const rawData = (await this._fetchStats(
      ENDPOINTS.BOX_SCORE_ADVANCED,
      {
        GameID: gameId,
        LeagueID: LeagueID.NBA,
      },
      { returnRaw: true }
    )) as Record<string, unknown>

    // V3 box score structure: { boxScoreAdvanced: { homeTeam: { players }, awayTeam: { players } } }
    const boxScore = (rawData['boxScoreAdvanced'] ?? {}) as Record<string, unknown>
    const homeTeam = (boxScore['homeTeam'] ?? {}) as Record<string, unknown>
    const awayTeam = (boxScore['awayTeam'] ?? {}) as Record<string, unknown>

    // Extract and normalize player stats from both teams using V3 advanced normalization
    const homePlayers = ((homeTeam['players'] ?? []) as Record<string, unknown>[]).map((p) =>
      normalizeV3AdvancedPlayerStats(p, homeTeam)
    )
    const awayPlayers = ((awayTeam['players'] ?? []) as Record<string, unknown>[]).map((p) =>
      normalizeV3AdvancedPlayerStats(p, awayTeam)
    )

    // Advanced stats have different fields, return as-is without traditional schema validation
    const playerStats = [...homePlayers, ...awayPlayers]

    // Extract and normalize team stats using V3 advanced normalization
    const homeTeamStats = normalizeV3AdvancedTeamStats(homeTeam)
    const awayTeamStats = normalizeV3AdvancedTeamStats(awayTeam)

    return {
      gameId: (boxScore['gameId'] as string) ?? gameId,
      homeTeamId: (boxScore['homeTeamId'] as number) ?? 0,
      awayTeamId: (boxScore['awayTeamId'] as number) ?? 0,
      gameDateEst: (boxScore['gameTimeLocal'] as string) ?? '',
      playerStats,
      teamStats: [homeTeamStats, awayTeamStats],
    } as unknown as BoxScoreAdvanced
  }

  /**
   * Get play-by-play data for a game.
   * @param gameId - NBA game ID (10 digits)
   */
  async getPlayByPlay(gameId: string): Promise<PlayByPlayAction[]> {
    validateGameId(gameId)

    // Legacy playbyplay endpoint requires StartPeriod and EndPeriod params
    const data = await this._fetchStats(ENDPOINTS.PLAY_BY_PLAY, {
      GameID: gameId,
      LeagueID: LeagueID.NBA,
      StartPeriod: 0,
      EndPeriod: 14, // Covers all possible periods including OT
    })

    const resultSet = data['PlayByPlay'] ?? []
    return resultSet.map((row) => normalizeKeys(row)) as unknown as PlayByPlayAction[]
  }

  // ===========================================================================
  // Other Endpoints
  // ===========================================================================

  /**
   * Get shot chart detail for a player.
   * @param options - Shot chart options (playerId required, others optional)
   */
  async getShotChartDetail(options: ShotChartOptions): Promise<ShotChartShot[]> {
    const {
      playerId,
      teamId = 0,
      season,
      seasonType = SeasonType.REGULAR,
      gameId = '',
      contextMeasure = 'FGA',
      dateFrom = '',
      dateTo = '',
      gameSegment = '',
      lastNGames = 0,
      location = '',
      month = 0,
      opponentTeamId = 0,
      outcome = '',
      period = 0,
      vsConference = '',
      vsDivision = '',
    } = options

    validatePlayerId(playerId)
    if (teamId) validateTeamId(teamId)
    const resolvedSeason = season ?? getCurrentSeason()
    validateSeason(resolvedSeason)

    const data = await this._fetchStats(ENDPOINTS.SHOT_CHART_DETAIL, {
      PlayerID: playerId,
      TeamID: teamId,
      Season: resolvedSeason,
      SeasonType: seasonType,
      LeagueID: LeagueID.NBA,
      ContextMeasure: contextMeasure,
      PlayerPosition: '',
      DateFrom: dateFrom,
      DateTo: dateTo,
      GameID: gameId,
      GameSegment: gameSegment,
      LastNGames: lastNGames,
      Location: location,
      Month: month,
      OpponentTeamID: opponentTeamId,
      Outcome: outcome,
      Period: period,
      RookieYear: '',
      SeasonSegment: '',
      VsConference: vsConference,
      VsDivision: vsDivision,
    })

    const resultSet = data['Shot_Chart_Detail'] ?? []
    return resultSet.map((row) => normalizeKeys(row)) as unknown as ShotChartShot[]
  }

  /**
   * Get NBA draft history.
   * @param season - Season year (e.g., 2024 for 2024 draft)
   */
  async getDraftHistory(season?: number): Promise<DraftHistoryEntry[]> {
    const data = await this._fetchStats(ENDPOINTS.DRAFT_HISTORY, {
      Season: season ?? '',
      LeagueID: LeagueID.NBA,
      TopX: '',
      TeamID: '',
      RoundNum: '',
      RoundPick: '',
      OverallPick: '',
      College: '',
    })

    const resultSet = data['DraftHistory'] ?? []
    const normalized = resultSet.map((row) => normalizeKeys(row))
    // SAFETY: parseArraySafe validates structure, falls back to raw data if validation fails
    return parseArraySafe(DraftHistoryEntrySchema, normalized) as DraftHistoryEntry[]
  }

  // ===========================================================================
  // Live API Endpoints
  // ===========================================================================

  /**
   * Get today's live scoreboard.
   */
  async getLiveScoreboard(): Promise<LiveScoreboard> {
    const data = await this._fetchLive(ENDPOINTS.LIVE_SCOREBOARD)

    const response = data as { scoreboard?: LiveScoreboard }
    return response.scoreboard ?? ({} as LiveScoreboard)
  }

  /**
   * Get live box score for a game.
   * @param gameId - NBA game ID (10 digits)
   */
  async getLiveBoxScore(gameId: string): Promise<LiveBoxScore> {
    validateGameId(gameId)

    const data = await this._fetchLive(ENDPOINTS.LIVE_BOXSCORE, gameId)

    const response = data as { game?: LiveBoxScore }
    return response.game ?? ({} as LiveBoxScore)
  }

  /**
   * Get live play-by-play for a game.
   * @param gameId - NBA game ID (10 digits)
   */
  async getLivePlayByPlay(gameId: string): Promise<LivePlayByPlay> {
    validateGameId(gameId)

    const data = await this._fetchLive(ENDPOINTS.LIVE_PLAYBYPLAY, gameId)

    const response = data as { game?: LivePlayByPlay }
    return response.game ?? ({} as LivePlayByPlay)
  }

  /**
   * Get today's betting odds.
   */
  async getLiveOdds(): Promise<LiveOdds> {
    const data = await this._fetchLive(ENDPOINTS.LIVE_ODDS)
    return data as LiveOdds
  }

  // ===========================================================================
  // Static Data Accessors
  // ===========================================================================

  /**
   * Get all NBA teams (static data).
   */
  getTeams(): Team[] {
    return [...teams]
  }

  /**
   * Get all NBA players (static data).
   */
  getPlayers(): Player[] {
    return [...players]
  }

  /**
   * Get active NBA players (static data).
   */
  getActivePlayers(): Player[] {
    return getActivePlayers()
  }

  /**
   * Get inactive/historical NBA players (static data).
   */
  getInactivePlayers(): Player[] {
    return getInactivePlayers()
  }

  /**
   * Find a team by ID (static data).
   */
  findTeamById(teamId: number): Team | null {
    return findTeamById(teamId)
  }

  /**
   * Find a team by abbreviation (static data).
   */
  findTeamByAbbreviation(abbreviation: string): Team | null {
    return findTeamByAbbreviation(abbreviation)
  }

  /**
   * Find teams by name pattern (static data).
   */
  findTeamsByName(pattern: string): Team[] {
    return findTeamsByName(pattern)
  }

  /**
   * Find a player by ID (static data).
   */
  findPlayerById(playerId: number): Player | null {
    return findPlayerById(playerId)
  }

  /**
   * Find players by name pattern (static data).
   */
  findPlayersByName(pattern: string): Player[] {
    return findPlayersByName(pattern)
  }
}

export default NbaAPI
