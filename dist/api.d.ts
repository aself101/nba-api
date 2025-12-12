/**
 * NBA API - Main API Class
 *
 * TypeScript wrapper for NBA Stats and Live APIs.
 */
import type { NbaAPIOptions, Player, Team, PlayerCareerStats, PlayerGameLog, CommonPlayerInfo, PlayerSummary, PlayerEstimatedMetrics, TeamRoster, TeamGameLog, TeamInfoCommon, TeamYearByYearStats, LeagueLeader, LeagueDashPlayerStats, LeagueStanding, GameFinderResult, LeagueGameLogEntry, Scoreboard, BoxScoreTraditional, BoxScoreAdvanced, PlayByPlayAction, ShotChartShot, DraftHistoryEntry, LiveScoreboard, LiveBoxScore, LivePlayByPlay, LiveOdds, PlayerCareerOptions, LeagueDashOptions, GameFinderOptions, ShotChartOptions } from './types.js';
export * from './types.js';
export * from './config.js';
export { teams, findTeamById, findTeamByAbbreviation, findTeamsByName, findTeamsByCity, findTeamsByState, } from './data/teams.js';
export { players, findPlayerById, findPlayersByName, getActivePlayers, getInactivePlayers, } from './data/players.js';
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
export declare class NbaAPI {
    private logger;
    private timeout;
    private clientTier;
    private isConnected;
    private puppeteerClient;
    constructor(options?: NbaAPIOptions);
    /**
     * Initialize the API client.
     * For tier2 or auto mode, this pre-initializes the Puppeteer browser.
     */
    connect(): Promise<void>;
    /**
     * Close the API client and cleanup resources.
     */
    close(): Promise<void>;
    /**
     * Check if the client is connected.
     */
    get connected(): boolean;
    private _fetchStats;
    private _fetchLive;
    /**
     * Get game info (gameCode and date) from Live API.
     * @param gameId - NBA game ID (10 digits)
     * @returns Object with gameCode and gameDateEst
     */
    private _getGameInfo;
    /**
     * Get player career statistics.
     * @param playerId - NBA player ID
     * @param options - Optional parameters (perMode, leagueId)
     */
    getPlayerCareerStats(playerId: number, options?: PlayerCareerOptions): Promise<PlayerCareerStats[]>;
    /**
     * Get player game log for a season.
     * @param playerId - NBA player ID
     * @param season - Season in "YYYY-YY" format (default: current)
     * @param seasonType - Season type (default: Regular Season)
     */
    getPlayerGameLog(playerId: number, season?: string, seasonType?: string): Promise<PlayerGameLog[]>;
    /**
     * Get common player information (bio, draft info, etc.).
     * @param playerId - NBA player ID
     */
    getCommonPlayerInfo(playerId: number): Promise<CommonPlayerInfo>;
    /**
     * Get list of all players.
     * @param season - Season in "YYYY-YY" format (default: current)
     * @param isOnlyCurrentSeason - Only return players from specified season
     */
    getCommonAllPlayers(season?: string, isOnlyCurrentSeason?: boolean): Promise<PlayerSummary[]>;
    /**
     * Get player estimated metrics (advanced stats).
     * @param season - Season in "YYYY-YY" format (default: current)
     */
    getPlayerEstimatedMetrics(season?: string): Promise<PlayerEstimatedMetrics[]>;
    /**
     * Get team roster.
     * @param teamId - NBA team ID
     * @param season - Season in "YYYY-YY" format (default: current)
     */
    getCommonTeamRoster(teamId: number, season?: string): Promise<TeamRoster[]>;
    /**
     * Get team game log for a season.
     * @param teamId - NBA team ID
     * @param season - Season in "YYYY-YY" format (default: current)
     * @param seasonType - Season type (default: Regular Season)
     */
    getTeamGameLog(teamId: number, season?: string, seasonType?: string): Promise<TeamGameLog[]>;
    /**
     * Get common team information.
     * @param teamId - NBA team ID
     * @param season - Season in "YYYY-YY" format (default: current)
     */
    getTeamInfoCommon(teamId: number, season?: string): Promise<TeamInfoCommon>;
    /**
     * Get team year-by-year statistics.
     * @param teamId - NBA team ID
     */
    getTeamYearByYearStats(teamId: number): Promise<TeamYearByYearStats[]>;
    /**
     * Get league leaders by stat category.
     * @param season - Season in "YYYY-YY" format (default: current)
     * @param statCategory - Stat category (PTS, REB, AST, etc.)
     */
    getLeagueLeaders(season?: string, statCategory?: string): Promise<LeagueLeader[]>;
    /**
     * Get league dashboard player stats.
     * @param options - Filter options
     */
    getLeagueDashPlayerStats(options?: LeagueDashOptions): Promise<LeagueDashPlayerStats[]>;
    /**
     * Get league standings.
     * @param season - Season in "YYYY-YY" format (default: current)
     * @param seasonType - Season type (default: Regular Season)
     */
    getLeagueStandings(season?: string, seasonType?: string): Promise<LeagueStanding[]>;
    /**
     * Search for games matching specific criteria.
     * @param options - Search options
     */
    getLeagueGameFinder(options?: GameFinderOptions): Promise<GameFinderResult[]>;
    /**
     * Get league game log for a season.
     * @param season - Season in "YYYY-YY" format (default: current)
     * @param seasonType - Season type (default: Regular Season)
     */
    getLeagueGameLog(season?: string, seasonType?: string): Promise<LeagueGameLogEntry[]>;
    /**
     * Get the scoreboard for a specific date.
     * @param gameDate - Date in YYYY-MM-DD format (default: today)
     */
    getScoreboard(gameDate?: string): Promise<Scoreboard>;
    /**
     * Get traditional box score for a game.
     * @param gameId - NBA game ID (10 digits)
     */
    getBoxScoreTraditional(gameId: string): Promise<BoxScoreTraditional>;
    /**
     * Get advanced box score for a game.
     * @param gameId - NBA game ID (10 digits)
     */
    getBoxScoreAdvanced(gameId: string): Promise<BoxScoreAdvanced>;
    /**
     * Get play-by-play data for a game.
     * @param gameId - NBA game ID (10 digits)
     */
    getPlayByPlay(gameId: string): Promise<PlayByPlayAction[]>;
    /**
     * Get shot chart detail for a player.
     * @param options - Shot chart options (playerId required, others optional)
     */
    getShotChartDetail(options: ShotChartOptions): Promise<ShotChartShot[]>;
    /**
     * Get NBA draft history.
     * @param season - Season year (e.g., 2024 for 2024 draft)
     */
    getDraftHistory(season?: number): Promise<DraftHistoryEntry[]>;
    /**
     * Get today's live scoreboard.
     */
    getLiveScoreboard(): Promise<LiveScoreboard>;
    /**
     * Get live box score for a game.
     * @param gameId - NBA game ID (10 digits)
     */
    getLiveBoxScore(gameId: string): Promise<LiveBoxScore>;
    /**
     * Get live play-by-play for a game.
     * @param gameId - NBA game ID (10 digits)
     */
    getLivePlayByPlay(gameId: string): Promise<LivePlayByPlay>;
    /**
     * Get today's betting odds.
     */
    getLiveOdds(): Promise<LiveOdds>;
    /**
     * Get all NBA teams (static data).
     */
    getTeams(): Team[];
    /**
     * Get all NBA players (static data).
     */
    getPlayers(): Player[];
    /**
     * Get active NBA players (static data).
     */
    getActivePlayers(): Player[];
    /**
     * Get inactive/historical NBA players (static data).
     */
    getInactivePlayers(): Player[];
    /**
     * Find a team by ID (static data).
     */
    findTeamById(teamId: number): Team | null;
    /**
     * Find a team by abbreviation (static data).
     */
    findTeamByAbbreviation(abbreviation: string): Team | null;
    /**
     * Find teams by name pattern (static data).
     */
    findTeamsByName(pattern: string): Team[];
    /**
     * Find a player by ID (static data).
     */
    findPlayerById(playerId: number): Player | null;
    /**
     * Find players by name pattern (static data).
     */
    findPlayersByName(pattern: string): Player[];
}
export default NbaAPI;
//# sourceMappingURL=api.d.ts.map