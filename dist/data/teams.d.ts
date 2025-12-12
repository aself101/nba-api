/**
 * NBA Teams Static Data
 *
 * Pre-loaded NBA team data for offline lookups.
 * Data sourced from nba_api Python package (updated November 2025).
 */
import type { Team } from '../types.js';
/**
 * All 30 NBA teams.
 */
export declare const teams: Team[];
/**
 * Find teams by name using regex pattern matching.
 * Searches full name, nickname, and city.
 * @param pattern - Regex pattern to match (case-insensitive)
 */
export declare function findTeamsByName(pattern: string): Team[];
/**
 * Find a team by its NBA team ID.
 * @param teamId - The NBA team ID
 */
export declare function findTeamById(teamId: number): Team | null;
/**
 * Find a team by its abbreviation (e.g., "LAL", "BOS").
 * @param abbreviation - The 3-letter team abbreviation (case-insensitive)
 */
export declare function findTeamByAbbreviation(abbreviation: string): Team | null;
/**
 * Find teams by state.
 * @param state - State name to match (case-insensitive)
 */
export declare function findTeamsByState(state: string): Team[];
/**
 * Find teams by city.
 * @param city - City name to match (case-insensitive)
 */
export declare function findTeamsByCity(city: string): Team[];
/**
 * Get all teams.
 */
export declare function getTeams(): Team[];
/**
 * Get all team abbreviations.
 */
export declare function getTeamAbbreviations(): string[];
/**
 * Get all team IDs.
 */
export declare function getTeamIds(): number[];
//# sourceMappingURL=teams.d.ts.map