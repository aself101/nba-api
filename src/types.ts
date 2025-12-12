/**
 * NBA API TypeScript Types
 *
 * Type definitions for all API responses, parameters, and internal structures.
 */

// =============================================================================
// API Options & Configuration
// =============================================================================

export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'NONE'
export type ClientTier = 'tier1' | 'tier2' | 'auto'

export interface NbaAPIOptions {
  /** Log level for console output */
  logLevel?: LogLevel
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  /** Proxy URL for requests */
  proxy?: string
  /** HTTP client tier: 'tier1' (fetch), 'tier2' (puppeteer), 'auto' (fallback) */
  clientTier?: ClientTier
}

// =============================================================================
// HTTP Response Types
// =============================================================================

export interface NbaResponse<T = unknown> {
  /** The request URL */
  url: string
  /** HTTP status code */
  statusCode: number
  /** Parsed and normalized data */
  data: T
  /** Raw response body */
  raw: unknown
}

export interface DataSet {
  /** Column headers */
  headers: string[]
  /** Row data (array of arrays) */
  data: unknown[][]
}

export interface RawResultSet {
  name: string
  headers: string[]
  rowSet: unknown[][]
}

export interface RawStatsResponse {
  resource?: string
  parameters?: Record<string, unknown>
  resultSets?: RawResultSet[]
  resultSet?: RawResultSet | RawResultSet[]
}

export interface NormalizedResponse {
  [dataSetName: string]: Record<string, unknown>[]
}

// =============================================================================
// Static Data Types
// =============================================================================

export interface Player {
  /** NBA player ID */
  id: number
  /** Full name (e.g., "LeBron James") */
  fullName: string
  /** First name */
  firstName: string
  /** Last name */
  lastName: string
  /** Whether player is currently active */
  isActive: boolean
}

export interface Team {
  /** NBA team ID */
  id: number
  /** Full team name (e.g., "Los Angeles Lakers") */
  fullName: string
  /** Team abbreviation (e.g., "LAL") */
  abbreviation: string
  /** Team nickname (e.g., "Lakers") */
  nickname: string
  /** City name */
  city: string
  /** State abbreviation */
  state: string
  /** Year the franchise was founded */
  yearFounded: number
}

// =============================================================================
// Player Endpoint Response Types
// =============================================================================

export interface PlayerCareerStats {
  playerId: number
  seasonId: string
  leagueId: string
  teamId: number
  teamAbbreviation: string
  playerAge: number
  gamesPlayed: number
  gamesStarted: number
  minutes: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
  points: number
}

export interface PlayerGameLog {
  seasonId: string
  playerId: number
  gameId: string
  gameDate: string
  matchup: string
  winLoss: string
  minutes: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
  points: number
  plusMinus: number
}

export interface CommonPlayerInfo {
  playerId: number
  firstName: string
  lastName: string
  displayFirstLast: string
  displayLastCommaFirst: string
  birthDate: string
  school: string
  country: string
  lastAffiliation: string
  height: string
  weight: string
  seasonExp: number
  jersey: string
  position: string
  rosterStatus: string
  teamId: number
  teamName: string
  teamAbbreviation: string
  teamCity: string
  fromYear: number
  toYear: number
  draftYear: number
  draftRound: number
  draftNumber: number
  isActive: boolean
}

export interface PlayerSummary {
  playerId: number
  displayLastCommaFirst: string
  displayFirstLast: string
  rosterStatus: number
  fromYear: string
  toYear: string
  playerCode: string
  teamId: number
  teamCity: string
  teamName: string
  teamAbbreviation: string
  teamCode: string
  teamSlug: string
  gamesPlayedFlag: string
  otherLeagueExperienceCh: string
}

export interface PlayerEstimatedMetrics {
  playerId: number
  playerName: string
  gamesPlayed: number
  minutes: number
  estimatedOffensiveRating: number
  estimatedDefensiveRating: number
  estimatedNetRating: number
  estimatedAssistRatio: number
  estimatedOffensiveReboundPct: number
  estimatedDefensiveReboundPct: number
  estimatedReboundPct: number
  estimatedTurnoverPct: number
  estimatedUsagePct: number
  estimatedPace: number
  estimatedPie: number
}

// =============================================================================
// Team Endpoint Response Types
// =============================================================================

export interface TeamRoster {
  teamId: number
  season: string
  leagueId: string
  player: string
  playerSlug: string
  num: string
  position: string
  height: string
  weight: string
  birthDate: string
  age: number
  exp: string
  school: string
  playerId: number
  howAcquired: string
}

export interface TeamGameLog {
  teamId: number
  gameId: string
  gameDate: string
  matchup: string
  winLoss: string
  minutes: number
  points: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
  plusMinus: number
}

export interface TeamInfoCommon {
  teamId: number
  seasonYear: string
  teamCity: string
  teamName: string
  teamAbbreviation: string
  teamConference: string
  teamDivision: string
  teamCode: string
  teamSlug: string
  wins: number
  losses: number
  pct: number
  confRank: number
  divRank: number
  minYear: string
  maxYear: string
}

export interface TeamYearByYearStats {
  teamId: number
  teamCity: string
  teamName: string
  year: string
  gamesPlayed: number
  wins: number
  losses: number
  winPct: number
  conferenceRank: number
  divisionRank: number
  playoffRound: string
  points: number
  rebounds: number
  assists: number
  offensiveRebounds: number
  defensiveRebounds: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
}

// =============================================================================
// League-Wide Endpoint Response Types
// =============================================================================

export interface LeagueLeader {
  playerId: number
  rank: number
  player: string
  team: string
  gamesPlayed: number
  minutes: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
  playerEfficiency: number
  points: number
  assistsTurnoverRatio: number
  stealsToTurnover: number
}

export interface LeagueDashPlayerStats {
  playerId: number
  playerName: string
  teamId: number
  teamAbbreviation: string
  age: number
  gamesPlayed: number
  wins: number
  losses: number
  winPct: number
  minutes: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  turnovers: number
  steals: number
  blocks: number
  blocksAgainst: number
  personalFouls: number
  personalFoulsDrawn: number
  points: number
  plusMinus: number
}

export interface LeagueStanding {
  leagueId: string
  seasonId: string
  teamId: number
  teamCity: string
  teamName: string
  teamSlug: string
  conference: string
  conferenceRecord: string
  playoffRank: number
  clinchIndicator: string
  division: string
  divisionRecord: string
  divisionRank: number
  wins: number
  losses: number
  winPct: number
  leagueRank: number
  record: string
  home: string
  road: string
  last10: string
  last10Home: string
  last10Road: string
  ot: string
  threePtsOrLess: string
  tenPtsOrMore: string
  longHomeStreak: number
  longRoadStreak: number
  longWinStreak: number
  longLossStreak: number
  currentHomeStreak: number
  currentRoadStreak: number
  currentStreak: number
  conferenceGamesBack: number
  divisionGamesBack: number
  clinchedConferenceTitle: number
  clinchedDivisionTitle: number
  clinchedPlayoffBirth: number
  clinchedPlayIn: number
  eliminatedConference: number
  eliminatedDivision: number
  aheadAtHalf: string
  behindAtHalf: string
  tiedAtHalf: string
  aheadAtThird: string
  behindAtThird: string
  tiedAtThird: string
  score100Pts: string
  oppScore100Pts: string
  oppOver500: string
  leadInFgPct: string
  leadInReb: string
  fewerTurnovers: string
  pointsPg: number
  oppPointsPg: number
  diffPointsPg: number
  vsEast: string
  vsWest: string
  jan: string
  feb: string
  mar: string
  apr: string
  may: string
  jun: string
  jul: string
  aug: string
  sep: string
  oct: string
  nov: string
  dec: string
  preStar: string
  postStar: string
}

export interface GameFinderResult {
  seasonId: string
  teamId: number
  teamAbbreviation: string
  teamName: string
  gameId: string
  gameDate: string
  matchup: string
  winLoss: string
  minutes: number
  points: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
  plusMinus: number
}

export interface LeagueGameLogEntry {
  seasonId: string
  teamId: number
  teamAbbreviation: string
  teamName: string
  gameId: string
  gameDate: string
  matchup: string
  winLoss: string
  minutes: number
  points: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
  plusMinus: number
  videoAvailable: number
}

// =============================================================================
// Game Endpoint Response Types
// =============================================================================

export interface ScoreboardGame {
  gameId: string
  gameCode: string
  gameStatus: number
  gameStatusText: string
  period: number
  gameClock: string
  gameTimeUTC: string
  gameEt: string
  regulationPeriods: number
  ifNecessary: boolean
  seriesGameNumber: string
  seriesText: string
  homeTeam: ScoreboardTeam
  awayTeam: ScoreboardTeam
}

export interface ScoreboardTeam {
  teamId: number
  teamName: string
  teamCity: string
  teamTricode: string
  wins: number
  losses: number
  score: number
  seed: number | null
  inBonus: string | null
  timeoutsRemaining: number
}

export interface Scoreboard {
  gameDate: string
  leagueId: string
  leagueName: string
  games: ScoreboardGame[]
}

export interface BoxScorePlayerStats {
  playerId: number
  teamId: number
  teamAbbreviation: string
  teamCity: string
  playerName: string
  playerNameI: string
  startPosition: string
  comment: string
  minutes: string
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
  points: number
  plusMinus: number
}

export interface BoxScoreTeamStats {
  teamId: number
  teamName: string
  teamAbbreviation: string
  teamCity: string
  minutes: string
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPct: number
  threePointersMade: number
  threePointersAttempted: number
  threePointPct: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  freeThrowPct: number
  offensiveRebounds: number
  defensiveRebounds: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  personalFouls: number
  points: number
  plusMinus: number
}

export interface BoxScoreTraditional {
  gameId: string
  homeTeamId: number
  awayTeamId: number
  gameDateEst: string
  gameCode: string
  playerStats: BoxScorePlayerStats[]
  teamStats: BoxScoreTeamStats[]
}

export interface BoxScoreAdvancedPlayerStats {
  playerId: number
  playerName: string
  teamId: number
  teamAbbreviation: string
  minutes: string
  offensiveRating: number
  defensiveRating: number
  netRating: number
  assistPercentage: number
  assistToTurnover: number
  assistRatio: number
  offensiveReboundPercentage: number
  defensiveReboundPercentage: number
  reboundPercentage: number
  turnoverRatio: number
  effectiveFieldGoalPercentage: number
  trueShootingPercentage: number
  usagePercentage: number
  pace: number
  pie: number
}

export interface BoxScoreAdvanced {
  gameId: string
  homeTeamId: number
  awayTeamId: number
  gameDateEst: string
  gameCode: string
  playerStats: BoxScoreAdvancedPlayerStats[]
  teamStats: Record<string, unknown>[]
}

export interface PlayByPlayAction {
  gameId: string
  eventNum: number
  eventMsgType: number
  eventMsgActionType: number
  period: number
  wcTimeString: string
  pcTimeString: string
  homeDescription: string | null
  neutralDescription: string | null
  visitorDescription: string | null
  score: string | null
  scoreMargin: string | null
  player1Type: number
  player1Id: number
  player1Name: string | null
  player1TeamId: number | null
  player2Type: number
  player2Id: number
  player2Name: string | null
  player2TeamId: number | null
  player3Type: number
  player3Id: number
  player3Name: string | null
  player3TeamId: number | null
}

// =============================================================================
// Shot Chart Types
// =============================================================================

export interface ShotChartShot {
  gridType: string
  gameId: string
  gameEventId: number
  playerId: number
  playerName: string
  teamId: number
  teamName: string
  period: number
  minutesRemaining: number
  secondsRemaining: number
  eventType: string
  actionType: string
  shotType: string
  shotZoneBasic: string
  shotZoneArea: string
  shotZoneRange: string
  shotDistance: number
  locX: number
  locY: number
  shotAttemptedFlag: number
  shotMadeFlag: number
  gameDate: string
  htm: string
  vtm: string
}

// =============================================================================
// Draft Types
// =============================================================================

export interface DraftHistoryEntry {
  playerId: number
  playerName: string
  seasonId: string
  roundNumber: number
  roundPick: number
  overallPick: number
  draftType: string
  teamId: number
  teamCity: string
  teamName: string
  teamAbbreviation: string
  organization: string
  organizationType: string
  playerProfileFlag: number
}

// =============================================================================
// Live API Response Types
// =============================================================================

export interface LiveScoreboardGame {
  gameId: string
  gameCode: string
  gameStatus: number
  gameStatusText: string
  period: number
  gameClock: string
  gameTimeUTC: string
  gameEt: string
  regulationPeriods: number
  ifNecessary: boolean
  seriesGameNumber: string
  seriesText: string
  homeTeam: LiveTeam
  awayTeam: LiveTeam
  gameLeaders: LiveGameLeaders
  pbOdds: LivePbOdds
}

export interface LiveTeam {
  teamId: number
  teamName: string
  teamCity: string
  teamTricode: string
  wins: number
  losses: number
  score: number
  seed: number | null
  inBonus: string | null
  timeoutsRemaining: number
  periods: LivePeriod[]
}

export interface LivePeriod {
  period: number
  periodType: string
  score: number
}

export interface LiveGameLeaders {
  homeLeaders: LivePlayerLeader
  awayLeaders: LivePlayerLeader
}

export interface LivePlayerLeader {
  personId: number
  name: string
  jerseyNum: string
  position: string
  teamTricode: string
  playerSlug: string | null
  points: number
  rebounds: number
  assists: number
}

export interface LivePbOdds {
  team: string | null
  odds: number
  suspended: number
}

export interface LiveScoreboard {
  gameDate: string
  leagueId: string
  leagueName: string
  games: LiveScoreboardGame[]
}

export interface LiveBoxScorePlayer {
  status: string
  order: number
  personId: number
  jerseyNum: string
  position: string | null
  starter: string
  oncourt: string
  played: string
  statistics: LivePlayerStatistics
  name: string
  nameI: string
  firstName: string
  familyName: string
}

export interface LivePlayerStatistics {
  assists: number
  blocks: number
  blocksReceived: number
  fieldGoalsAttempted: number
  fieldGoalsMade: number
  fieldGoalsPercentage: number
  foulsOffensive: number
  foulsDrawn: number
  foulsPersonal: number
  foulsTechnical: number
  freeThrowsAttempted: number
  freeThrowsMade: number
  freeThrowsPercentage: number
  minus: number
  minutes: string
  minutesCalculated: string
  plus: number
  plusMinusPoints: number
  points: number
  pointsFastBreak: number
  pointsInThePaint: number
  pointsSecondChance: number
  reboundsDefensive: number
  reboundsOffensive: number
  reboundsTotal: number
  steals: number
  threePointersAttempted: number
  threePointersMade: number
  threePointersPercentage: number
  turnovers: number
  twoPointersAttempted: number
  twoPointersMade: number
  twoPointersPercentage: number
}

export interface LiveTeamStatistics {
  assists: number
  assistsTurnoverRatio: number
  benchPoints: number
  biggestLead: number
  biggestLeadScore: string
  biggestScoringRun: number
  biggestScoringRunScore: string
  blocks: number
  blocksReceived: number
  fastBreakPointsAttempted: number
  fastBreakPointsMade: number
  fastBreakPointsPercentage: number
  fieldGoalsAttempted: number
  fieldGoalsEffectiveAdjusted: number
  fieldGoalsMade: number
  fieldGoalsPercentage: number
  foulsOffensive: number
  foulsDrawn: number
  foulsPersonal: number
  foulsTeam: number
  foulsTeamTechnical: number
  foulsTechnical: number
  freeThrowsAttempted: number
  freeThrowsMade: number
  freeThrowsPercentage: number
  leadChanges: number
  minutes: string
  minutesCalculated: string
  points: number
  pointsAgainst: number
  pointsFastBreak: number
  pointsFromTurnovers: number
  pointsInThePaint: number
  pointsInThePaintAttempted: number
  pointsInThePaintMade: number
  pointsInThePaintPercentage: number
  pointsSecondChance: number
  reboundsDefensive: number
  reboundsOffensive: number
  reboundsPersonal: number
  reboundsTeam: number
  reboundsTeamDefensive: number
  reboundsTeamOffensive: number
  reboundsTotal: number
  secondChancePointsAttempted: number
  secondChancePointsMade: number
  secondChancePointsPercentage: number
  steals: number
  threePointersAttempted: number
  threePointersMade: number
  threePointersPercentage: number
  timeLeading: string
  timesTied: number
  trueShootingAttempts: number
  trueShootingPercentage: number
  turnovers: number
  turnoversTeam: number
  turnoversTotal: number
  twoPointersAttempted: number
  twoPointersMade: number
  twoPointersPercentage: number
}

export interface LiveBoxScoreTeam {
  teamId: number
  teamName: string
  teamCity: string
  teamTricode: string
  score: number
  inBonus: string | null
  timeoutsRemaining: number
  periods: LivePeriod[]
  players: LiveBoxScorePlayer[]
  statistics: LiveTeamStatistics
}

export interface LiveBoxScore {
  gameId: string
  gameTimeLocal: string
  gameTimeUTC: string
  gameTimeHome: string
  gameTimeAway: string
  gameEt: string
  duration: number
  gameCode: string
  gameStatusText: string
  gameStatus: number
  regulationPeriods: number
  period: number
  gameClock: string
  attendance: number
  sellout: string
  arena: LiveArena
  officials: LiveOfficial[]
  homeTeam: LiveBoxScoreTeam
  awayTeam: LiveBoxScoreTeam
}

export interface LiveArena {
  arenaId: number
  arenaName: string
  arenaCity: string
  arenaState: string
  arenaCountry: string
  arenaTimezone: string
}

export interface LiveOfficial {
  personId: number
  name: string
  nameI: string
  firstName: string
  familyName: string
  jerseyNum: string
  assignment: string
}

export interface LivePlayByPlayAction {
  actionNumber: number
  clock: string
  timeActual: string
  period: number
  periodType: string
  teamId: number | null
  teamTricode: string | null
  actionType: string
  subType: string | null
  descriptor: string | null
  qualifiers: string[]
  personId: number | null
  x: number | null
  y: number | null
  area: string | null
  areaDetail: string | null
  side: string | null
  shotDistance: number | null
  possession: number | null
  scoreHome: string
  scoreAway: string
  edited: string
  orderNumber: number
  xLegacy: number | null
  yLegacy: number | null
  isFieldGoal: number
  shotResult: string | null
  pointsTotal: number | null
  description: string
}

export interface LivePlayByPlay {
  gameId: string
  actions: LivePlayByPlayAction[]
}

export interface LiveOddsGame {
  gameId: string
  srId: string
  srMatchId: string
  homeTeamId: number
  awayTeamId: number
  markets: LiveOddsMarket[]
}

export interface LiveOddsMarket {
  name: string
  oddsTypeId: number
  groupName: string
  books: LiveOddsBook[]
}

export interface LiveOddsBook {
  id: string
  name: string
  outcomes: LiveOddsOutcome[]
}

export interface LiveOddsOutcome {
  oddsFieldId: number
  type: string
  odds: number
  openingOdds: number
  oddsTrend: string
  spread: number | null
  openingSpread: number | null
}

export interface LiveOdds {
  games: LiveOddsGame[]
}

// =============================================================================
// Parameter Types for API Methods
// =============================================================================

export interface PlayerCareerOptions {
  perMode?: string
  leagueId?: string
}

export interface LeagueDashOptions {
  perMode?: string
  measureType?: string
  season?: string
  seasonType?: string
  conference?: string
  division?: string
  teamId?: number
  outcome?: string
  location?: string
  month?: number
  period?: number
  lastNGames?: number
}

export interface GameFinderOptions {
  playerOrTeam?: 'P' | 'T'
  season?: string
  seasonType?: string
  leagueId?: string
  teamId?: number
  playerId?: number
  vsTeamId?: number
  vsConference?: string
  vsDivision?: string
  outcome?: string
  location?: string
  dateFrom?: string
  dateTo?: string
}

export interface ShotChartOptions {
  playerId: number
  teamId?: number
  season?: string
  seasonType?: string
  gameId?: string
  contextMeasure?: string
  dateFrom?: string
  dateTo?: string
  gameSegment?: string
  lastNGames?: number
  location?: string
  month?: number
  opponentTeamId?: number
  outcome?: string
  period?: number
  vsConference?: string
  vsDivision?: string
}

// =============================================================================
// CLI Types
// =============================================================================

export interface CLIOptions {
  // Category flags
  all?: boolean
  allPlayerEndpoints?: boolean
  allTeamEndpoints?: boolean
  allLeagueEndpoints?: boolean
  live?: boolean

  // Endpoint flags
  playerCareer?: boolean
  playerGameLog?: boolean
  playerInfo?: boolean
  allPlayers?: boolean
  playerMetrics?: boolean
  teamRoster?: boolean
  teamGameLog?: boolean
  teamInfo?: boolean
  teamHistory?: boolean
  leagueLeaders?: boolean
  leagueDashPlayers?: boolean
  standings?: boolean
  gameFinder?: boolean
  leagueGameLog?: boolean
  scoreboard?: boolean
  boxScore?: boolean
  boxScoreAdvanced?: boolean
  playByPlay?: boolean
  shotChart?: boolean
  draftHistory?: boolean
  liveScoreboard?: boolean
  liveBoxScore?: boolean
  livePlayByPlay?: boolean
  liveOdds?: boolean

  // Parameters
  season?: string
  startSeason?: string
  endSeason?: string
  playerId?: number
  teamId?: number
  gameId?: string
  gameDate?: string
  seasonType?: string
  perMode?: string
  statCategory?: string

  // Options
  outputDir?: string
  logLevel?: string
  dryRun?: boolean
  examples?: boolean
  client?: string
}
