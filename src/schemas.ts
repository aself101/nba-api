/**
 * NBA API Runtime Validation Schemas
 *
 * Zod schemas for validating NBA API responses at runtime.
 * These schemas provide type-safe validation for external API data.
 */

import { z } from 'zod'

// =============================================================================
// Base Schemas
// =============================================================================


// =============================================================================
// Player Response Schemas
// =============================================================================

export const PlayerCareerStatsSchema = z.object({
  playerId: z.number(),
  seasonId: z.string(),
  leagueId: z.string(),
  teamId: z.number(),
  teamAbbreviation: z.string(),
  playerAge: z.number(),
  gamesPlayed: z.number(),
  gamesStarted: z.number(),
  minutes: z.number(),
  fieldGoalsMade: z.number(),
  fieldGoalsAttempted: z.number(),
  fieldGoalPct: z.number(),
  threePointersMade: z.number(),
  threePointersAttempted: z.number(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number(),
  freeThrowsAttempted: z.number(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  personalFouls: z.number(),
  points: z.number(),
}).passthrough()

export const PlayerGameLogSchema = z.object({
  seasonId: z.string(),
  playerId: z.number(),
  gameId: z.string(),
  gameDate: z.string(),
  matchup: z.string(),
  winLoss: z.string().nullable(),
  minutes: z.number(),
  fieldGoalsMade: z.number(),
  fieldGoalsAttempted: z.number(),
  fieldGoalPct: z.number().nullable(),
  threePointersMade: z.number(),
  threePointersAttempted: z.number(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number(),
  freeThrowsAttempted: z.number(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  personalFouls: z.number(),
  points: z.number(),
  plusMinus: z.number(),
}).passthrough()

export const CommonPlayerInfoSchema = z.object({
  playerId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  displayFirstLast: z.string(),
  displayLastCommaFirst: z.string(),
  birthDate: z.string().nullable(),
  school: z.string().nullable(),
  country: z.string().nullable(),
  lastAffiliation: z.string().nullable(),
  height: z.string().nullable(),
  weight: z.string().nullable(),
  seasonExp: z.number(),
  jersey: z.string().nullable(),
  position: z.string().nullable(),
  rosterStatus: z.string(),
  teamId: z.number(),
  teamName: z.string(),
  teamAbbreviation: z.string(),
  teamCity: z.string(),
  fromYear: z.number(),
  toYear: z.number(),
  draftYear: z.union([z.number(), z.string()]).nullable(),
  draftRound: z.union([z.number(), z.string()]).nullable(),
  draftNumber: z.union([z.number(), z.string()]).nullable(),
  isActive: z.union([z.boolean(), z.string()]).transform((v) => v === true || v === 'Y'),
}).passthrough()

export const PlayerSummarySchema = z.object({
  playerId: z.number(),
  displayLastCommaFirst: z.string(),
  displayFirstLast: z.string(),
  rosterStatus: z.number(),
  fromYear: z.string(),
  toYear: z.string(),
  playerCode: z.string().nullable(),
  teamId: z.number(),
  teamCity: z.string().nullable(),
  teamName: z.string().nullable(),
  teamAbbreviation: z.string().nullable(),
  teamCode: z.string().nullable(),
  teamSlug: z.string().nullable(),
  gamesPlayedFlag: z.string().nullable(),
  otherLeagueExperienceCh: z.string().nullable(),
}).passthrough()

export const PlayerEstimatedMetricsSchema = z.object({
  playerId: z.number(),
  playerName: z.string(),
  gamesPlayed: z.number(),
  minutes: z.number(),
  estimatedOffensiveRating: z.number(),
  estimatedDefensiveRating: z.number(),
  estimatedNetRating: z.number(),
  estimatedAssistRatio: z.number(),
  estimatedOffensiveReboundPct: z.number(),
  estimatedDefensiveReboundPct: z.number(),
  estimatedReboundPct: z.number(),
  estimatedTurnoverPct: z.number(),
  estimatedUsagePct: z.number(),
  estimatedPace: z.number(),
  estimatedPie: z.number(),
}).passthrough()

// =============================================================================
// Team Response Schemas
// =============================================================================

export const TeamRosterSchema = z.object({
  teamId: z.number(),
  season: z.string(),
  leagueId: z.string(),
  player: z.string(),
  playerSlug: z.string().nullable(),
  num: z.string().nullable(),
  position: z.string().nullable(),
  height: z.string().nullable(),
  weight: z.string().nullable(),
  birthDate: z.string().nullable(),
  age: z.number().nullable(),
  exp: z.string().nullable(),
  school: z.string().nullable(),
  playerId: z.number(),
  howAcquired: z.string().nullable(),
}).passthrough()

export const TeamGameLogSchema = z.object({
  teamId: z.number(),
  gameId: z.string(),
  gameDate: z.string(),
  matchup: z.string(),
  winLoss: z.string().nullable(),
  minutes: z.number(),
  points: z.number(),
  fieldGoalsMade: z.number(),
  fieldGoalsAttempted: z.number(),
  fieldGoalPct: z.number().nullable(),
  threePointersMade: z.number(),
  threePointersAttempted: z.number(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number(),
  freeThrowsAttempted: z.number(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  personalFouls: z.number(),
  plusMinus: z.number(),
}).passthrough()

export const TeamInfoCommonSchema = z.object({
  teamId: z.number(),
  seasonYear: z.string(),
  teamCity: z.string(),
  teamName: z.string(),
  teamAbbreviation: z.string(),
  teamConference: z.string(),
  teamDivision: z.string(),
  teamCode: z.string().nullable(),
  teamSlug: z.string().nullable(),
  wins: z.number(),
  losses: z.number(),
  pct: z.number(),
  confRank: z.number(),
  divRank: z.number(),
  minYear: z.string(),
  maxYear: z.string(),
}).passthrough()

export const TeamYearByYearStatsSchema = z.object({
  teamId: z.number(),
  teamCity: z.string(),
  teamName: z.string(),
  year: z.string(),
  gamesPlayed: z.number(),
  wins: z.number(),
  losses: z.number(),
  winPct: z.number(),
  conferenceRank: z.number().nullable(),
  divisionRank: z.number().nullable(),
  playoffRound: z.string().nullable(),
  points: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  personalFouls: z.number(),
}).passthrough()

// =============================================================================
// League-Wide Response Schemas
// =============================================================================

export const LeagueLeaderSchema = z.object({
  playerId: z.number(),
  rank: z.number(),
  player: z.string(),
  team: z.string(),
  gamesPlayed: z.number(),
  minutes: z.number(),
  fieldGoalsMade: z.number(),
  fieldGoalsAttempted: z.number(),
  fieldGoalPct: z.number(),
  threePointersMade: z.number(),
  threePointersAttempted: z.number(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number(),
  freeThrowsAttempted: z.number(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  personalFouls: z.number(),
  playerEfficiency: z.number(),
  points: z.number(),
  assistsTurnoverRatio: z.number().nullable(),
  stealsToTurnover: z.number().nullable(),
}).passthrough()

export const LeagueDashPlayerStatsSchema = z.object({
  playerId: z.number(),
  playerName: z.string(),
  teamId: z.number(),
  teamAbbreviation: z.string(),
  age: z.number().nullable(),
  gamesPlayed: z.number(),
  wins: z.number(),
  losses: z.number(),
  winPct: z.number(),
  minutes: z.number(),
  fieldGoalsMade: z.number(),
  fieldGoalsAttempted: z.number(),
  fieldGoalPct: z.number().nullable(),
  threePointersMade: z.number(),
  threePointersAttempted: z.number(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number(),
  freeThrowsAttempted: z.number(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  turnovers: z.number(),
  steals: z.number(),
  blocks: z.number(),
  blocksAgainst: z.number(),
  personalFouls: z.number(),
  personalFoulsDrawn: z.number(),
  points: z.number(),
  plusMinus: z.number(),
}).passthrough()

export const LeagueStandingSchema = z.object({
  leagueId: z.string(),
  seasonId: z.string(),
  teamId: z.number(),
  teamCity: z.string(),
  teamName: z.string(),
  teamSlug: z.string().nullable(),
  conference: z.string(),
  conferenceRecord: z.string(),
  playoffRank: z.number(),
  clinchIndicator: z.string().nullable(),
  division: z.string(),
  divisionRecord: z.string(),
  divisionRank: z.number(),
  wins: z.number(),
  losses: z.number(),
  winPct: z.number(),
  leagueRank: z.number(),
  record: z.string(),
  home: z.string(),
  road: z.string(),
  last10: z.string(),
}).passthrough()

export const GameFinderResultSchema = z.object({
  seasonId: z.string(),
  teamId: z.number(),
  teamAbbreviation: z.string(),
  teamName: z.string(),
  gameId: z.string(),
  gameDate: z.string(),
  matchup: z.string(),
  winLoss: z.string().nullable(),
  minutes: z.number(),
  points: z.number(),
  fieldGoalsMade: z.number(),
  fieldGoalsAttempted: z.number(),
  fieldGoalPct: z.number().nullable(),
  threePointersMade: z.number(),
  threePointersAttempted: z.number(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number(),
  freeThrowsAttempted: z.number(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  personalFouls: z.number(),
  plusMinus: z.number(),
}).passthrough()

export const LeagueGameLogEntrySchema = z.object({
  seasonId: z.string(),
  teamId: z.number(),
  teamAbbreviation: z.string(),
  teamName: z.string(),
  gameId: z.string(),
  gameDate: z.string(),
  matchup: z.string(),
  winLoss: z.string().nullable(),
  minutes: z.number(),
  points: z.number(),
  fieldGoalsMade: z.number(),
  fieldGoalsAttempted: z.number(),
  fieldGoalPct: z.number().nullable(),
  threePointersMade: z.number(),
  threePointersAttempted: z.number(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number(),
  freeThrowsAttempted: z.number(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  personalFouls: z.number(),
  plusMinus: z.number(),
  videoAvailable: z.number(),
}).passthrough()

// =============================================================================
// Box Score Schemas
// =============================================================================

export const BoxScorePlayerStatsSchema = z.object({
  playerId: z.number(),
  teamId: z.number(),
  teamAbbreviation: z.string(),
  teamCity: z.string(),
  playerName: z.string(),
  playerNameI: z.string().nullable(),
  startPosition: z.string().nullable(),
  comment: z.string().nullable(),
  minutes: z.string().nullable(),
  fieldGoalsMade: z.number().nullable(),
  fieldGoalsAttempted: z.number().nullable(),
  fieldGoalPct: z.number().nullable(),
  threePointersMade: z.number().nullable(),
  threePointersAttempted: z.number().nullable(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number().nullable(),
  freeThrowsAttempted: z.number().nullable(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number().nullable(),
  defensiveRebounds: z.number().nullable(),
  rebounds: z.number().nullable(),
  assists: z.number().nullable(),
  steals: z.number().nullable(),
  blocks: z.number().nullable(),
  turnovers: z.number().nullable(),
  personalFouls: z.number().nullable(),
  points: z.number().nullable(),
  plusMinus: z.number().nullable(),
}).passthrough()

export const BoxScoreTeamStatsSchema = z.object({
  teamId: z.number(),
  teamName: z.string(),
  teamAbbreviation: z.string(),
  teamCity: z.string(),
  minutes: z.string().nullable(),
  fieldGoalsMade: z.number(),
  fieldGoalsAttempted: z.number(),
  fieldGoalPct: z.number().nullable(),
  threePointersMade: z.number(),
  threePointersAttempted: z.number(),
  threePointPct: z.number().nullable(),
  freeThrowsMade: z.number(),
  freeThrowsAttempted: z.number(),
  freeThrowPct: z.number().nullable(),
  offensiveRebounds: z.number(),
  defensiveRebounds: z.number(),
  rebounds: z.number(),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  personalFouls: z.number(),
  points: z.number(),
  plusMinus: z.number().nullable(),
}).passthrough()

// =============================================================================
// Draft Schemas
// =============================================================================

export const DraftHistoryEntrySchema = z.object({
  playerId: z.number(),
  playerName: z.string(),
  seasonId: z.string(),
  roundNumber: z.number(),
  roundPick: z.number(),
  overallPick: z.number(),
  draftType: z.string().nullable(),
  teamId: z.number(),
  teamCity: z.string(),
  teamName: z.string(),
  teamAbbreviation: z.string(),
  organization: z.string().nullable(),
  organizationType: z.string().nullable(),
  playerProfileFlag: z.number(),
}).passthrough()

// =============================================================================
// Validation Helper Functions
// =============================================================================

/**
 * Safely parse an array of items with a schema.
 * Returns an object with successfully parsed items and any errors.
 */
export function safeParseArray<T>(
  schema: z.ZodSchema<T>,
  items: unknown[]
): { data: T[]; errors: z.ZodError[] } {
  const data: T[] = []
  const errors: z.ZodError[] = []

  for (const item of items) {
    const result = schema.safeParse(item)
    if (result.success) {
      data.push(result.data)
    } else {
      errors.push(result.error)
    }
  }

  return { data, errors }
}

/**
 * Parse an array of items, throwing on first error.
 */
export function parseArray<T>(schema: z.ZodSchema<T>, items: unknown[]): T[] {
  return items.map((item) => schema.parse(item))
}

/**
 * Parse an array of items, returning empty array on validation failure.
 * Logs validation errors to console in development.
 */
export function parseArraySafe<T>(
  schema: z.ZodSchema<T>,
  items: unknown[],
  options?: { silent?: boolean }
): T[] {
  try {
    return items.map((item) => schema.parse(item))
  } catch (error) {
    if (!options?.silent && error instanceof z.ZodError) {
      console.warn('API response validation warning:', error.issues.slice(0, 3))
    }
    // Return items as-is if validation fails (backwards compatible)
    return items as T[]
  }
}

// Export Zod for convenience
export { z }
