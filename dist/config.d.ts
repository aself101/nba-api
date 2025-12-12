/**
 * NBA API Configuration
 *
 * Constants, endpoints, parameter enums, and validation functions.
 */
export declare const STATS_BASE_URL = "https://stats.nba.com/stats";
export declare const LIVE_BASE_URL = "https://cdn.nba.com/static/json/liveData";
export declare const STATS_HEADERS: Record<string, string>;
export declare const LIVE_HEADERS: Record<string, string>;
export declare const ENDPOINTS: {
    readonly PLAYER_CAREER_STATS: "playercareerstats";
    readonly PLAYER_GAME_LOG: "playergamelog";
    readonly COMMON_PLAYER_INFO: "commonplayerinfo";
    readonly COMMON_ALL_PLAYERS: "commonallplayers";
    readonly PLAYER_ESTIMATED_METRICS: "playerestimatedmetrics";
    readonly COMMON_TEAM_ROSTER: "commonteamroster";
    readonly TEAM_GAME_LOG: "teamgamelog";
    readonly TEAM_INFO_COMMON: "teaminfocommon";
    readonly TEAM_YEAR_BY_YEAR_STATS: "teamyearbyyearstats";
    readonly LEAGUE_LEADERS: "leagueleaders";
    readonly LEAGUE_DASH_PLAYER_STATS: "leaguedashplayerstats";
    readonly LEAGUE_STANDINGS: "leaguestandingsv3";
    readonly LEAGUE_GAME_FINDER: "leaguegamefinder";
    readonly LEAGUE_GAME_LOG: "leaguegamelog";
    readonly SCOREBOARD: "scoreboardv3";
    readonly BOX_SCORE_TRADITIONAL: "boxscoretraditionalv3";
    readonly BOX_SCORE_ADVANCED: "boxscoreadvancedv3";
    readonly PLAY_BY_PLAY: "playbyplayv3";
    readonly SHOT_CHART_DETAIL: "shotchartdetail";
    readonly DRAFT_HISTORY: "drafthistory";
    readonly LIVE_SCOREBOARD: "scoreboard/todaysScoreboard_00.json";
    readonly LIVE_BOXSCORE: "boxscore/boxscore_{game_id}.json";
    readonly LIVE_PLAYBYPLAY: "playbyplay/playbyplay_{game_id}.json";
    readonly LIVE_ODDS: "odds/odds_todaysGames.json";
};
export type EndpointKey = keyof typeof ENDPOINTS;
export declare const SeasonType: {
    readonly REGULAR: "Regular Season";
    readonly PLAYOFFS: "Playoffs";
    readonly PRESEASON: "Pre Season";
    readonly PLAYIN: "PlayIn";
    readonly ALL_STAR: "All Star";
};
export type SeasonTypeValue = (typeof SeasonType)[keyof typeof SeasonType];
export declare const PerMode: {
    readonly TOTALS: "Totals";
    readonly PER_GAME: "PerGame";
    readonly PER_36: "Per36";
    readonly PER_48: "Per48";
    readonly PER_MINUTE: "PerMinute";
    readonly PER_POSSESSION: "PerPossession";
    readonly PER_PLAY: "PerPlay";
    readonly PER_100_POSSESSIONS: "Per100Possessions";
    readonly PER_100_PLAYS: "Per100Plays";
};
export type PerModeValue = (typeof PerMode)[keyof typeof PerMode];
export declare const MeasureType: {
    readonly BASE: "Base";
    readonly ADVANCED: "Advanced";
    readonly MISC: "Misc";
    readonly SCORING: "Scoring";
    readonly USAGE: "Usage";
    readonly OPPONENT: "Opponent";
    readonly FOUR_FACTORS: "Four Factors";
    readonly DEFENSE: "Defense";
};
export type MeasureTypeValue = (typeof MeasureType)[keyof typeof MeasureType];
export declare const LeagueID: {
    readonly NBA: "00";
    readonly ABA: "01";
    readonly WNBA: "10";
    readonly SUMMER_LEAGUE: "15";
    readonly G_LEAGUE: "20";
};
export type LeagueIDValue = (typeof LeagueID)[keyof typeof LeagueID];
export declare const Conference: {
    readonly EAST: "East";
    readonly WEST: "West";
};
export type ConferenceValue = (typeof Conference)[keyof typeof Conference];
export declare const Division: {
    readonly ATLANTIC: "Atlantic";
    readonly CENTRAL: "Central";
    readonly SOUTHEAST: "Southeast";
    readonly NORTHWEST: "Northwest";
    readonly PACIFIC: "Pacific";
    readonly SOUTHWEST: "Southwest";
};
export type DivisionValue = (typeof Division)[keyof typeof Division];
export declare const Outcome: {
    readonly WIN: "W";
    readonly LOSS: "L";
};
export type OutcomeValue = (typeof Outcome)[keyof typeof Outcome];
export declare const Location: {
    readonly HOME: "Home";
    readonly ROAD: "Road";
};
export type LocationValue = (typeof Location)[keyof typeof Location];
export declare const PlayerPosition: {
    readonly GUARD: "G";
    readonly FORWARD: "F";
    readonly CENTER: "C";
    readonly GUARD_FORWARD: "G-F";
    readonly FORWARD_GUARD: "F-G";
    readonly FORWARD_CENTER: "F-C";
    readonly CENTER_FORWARD: "C-F";
};
export type PlayerPositionValue = (typeof PlayerPosition)[keyof typeof PlayerPosition];
export declare const StatCategory: {
    readonly POINTS: "PTS";
    readonly REBOUNDS: "REB";
    readonly ASSISTS: "AST";
    readonly STEALS: "STL";
    readonly BLOCKS: "BLK";
    readonly FIELD_GOAL_PCT: "FG_PCT";
    readonly THREE_POINT_PCT: "FG3_PCT";
    readonly FREE_THROW_PCT: "FT_PCT";
    readonly EFFICIENCY: "EFF";
    readonly ASSISTS_TURNOVERS: "AST_TOV";
    readonly STEALS_TURNOVERS: "STL_TOV";
};
export type StatCategoryValue = (typeof StatCategory)[keyof typeof StatCategory];
export declare const GameSegment: {
    readonly FIRST_HALF: "First Half";
    readonly SECOND_HALF: "Second Half";
    readonly OVERTIME: "Overtime";
};
export type GameSegmentValue = (typeof GameSegment)[keyof typeof GameSegment];
export declare const ShotClockRange: {
    readonly RANGE_24_22: "24-22";
    readonly RANGE_22_18: "22-18 Very Early";
    readonly RANGE_18_15: "18-15 Early";
    readonly RANGE_15_7: "15-7 Average";
    readonly RANGE_7_4: "7-4 Late";
    readonly RANGE_4_0: "4-0 Very Late";
    readonly SHOT_CLOCK_OFF: "ShotClock Off";
};
export type ShotClockRangeValue = (typeof ShotClockRange)[keyof typeof ShotClockRange];
export declare const DEFAULTS: {
    readonly TIMEOUT: 30000;
    readonly LEAGUE_ID: "00";
    readonly PER_MODE: "Totals";
    readonly SEASON_TYPE: "Regular Season";
    readonly OUTPUT_DIR: "datasets";
    readonly RATE_LIMIT_MIN_MS: 1000;
    readonly RATE_LIMIT_MAX_MS: 3000;
};
/**
 * Get the current NBA season in "YYYY-YY" format.
 * NBA season starts in October, so if we're before October, use previous year.
 */
export declare function getCurrentSeason(): string;
/**
 * Get the current season year (start year of the season).
 */
export declare function getCurrentSeasonYear(): number;
/**
 * Format a year into NBA season format "YYYY-YY".
 * @param year - The starting year of the season (e.g., 2024 for 2024-25)
 */
export declare function formatSeason(year: number): string;
/**
 * Parse a season string to get the start year.
 * @param season - Season string in "YYYY-YY" format
 */
export declare function parseSeasonYear(season: string): number;
/**
 * Validate that a season string is in the correct format.
 * @param season - Season string to validate
 */
export declare function validateSeason(season: string): void;
/**
 * Generate an array of season strings for a year range.
 * @param startYear - Start year (inclusive)
 * @param endYear - End year (inclusive)
 */
export declare function generateSeasonRange(startYear: number, endYear: number): string[];
/**
 * Build a full URL for a stats API endpoint with query parameters.
 * @param endpoint - The endpoint name (from ENDPOINTS)
 * @param params - Query parameters
 */
export declare function buildStatsUrl(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>): string;
/**
 * Build a full URL for a live API endpoint.
 * @param endpoint - The endpoint path
 * @param gameId - Optional game ID for endpoints that require it
 */
export declare function buildLiveUrl(endpoint: string, gameId?: string): string;
/**
 * Validate that a player ID is a positive integer.
 */
export declare function validatePlayerId(playerId: number): void;
/**
 * Validate that a team ID is a positive integer.
 */
export declare function validateTeamId(teamId: number): void;
/**
 * Validate that a game ID is in the correct format.
 * NBA game IDs are typically 10 digits (e.g., "0022400001")
 */
export declare function validateGameId(gameId: string): void;
/**
 * Validate that a date is in YYYY-MM-DD format.
 */
export declare function validateDate(date: string): void;
/**
 * Validate that a value is one of the allowed options.
 */
export declare function validateEnum<T extends string>(value: string, allowedValues: readonly T[], paramName: string): void;
/**
 * Get today's date in YYYY-MM-DD format.
 */
export declare function getTodayDate(): string;
/**
 * Format a Date object to YYYY-MM-DD string.
 */
export declare function formatDate(date: Date): string;
/**
 * Get the NBA season start date (typically late October).
 * @param seasonYear - The starting year of the season
 */
export declare function getSeasonStartDate(seasonYear: number): string;
/**
 * Get the NBA season end date (typically mid-April for regular season).
 * @param seasonYear - The starting year of the season
 */
export declare function getSeasonEndDate(seasonYear: number): string;
//# sourceMappingURL=config.d.ts.map