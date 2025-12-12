/**
 * NBA Players Static Data
 *
 * Pre-loaded NBA player data for offline lookups.
 * Data sourced from nba_api Python package (updated November 2025).
 */
import type { Player } from '../types.js';
/**
 * All NBA players (historical and current).
 * Total: 5103 players
 */
export declare const players: Player[];
/**
 * Find players by name using regex pattern matching.
 * Searches full name, first name, and last name.
 * Handles accented characters by normalizing to ASCII.
 * @param pattern - Regex pattern to match (case-insensitive)
 */
export declare function findPlayersByName(pattern: string): Player[];
/**
 * Find a player by their NBA player ID.
 * @param playerId - The NBA player ID
 */
export declare function findPlayerById(playerId: number): Player | null;
/**
 * Find players by first name.
 * @param firstName - First name to match (case-insensitive)
 */
export declare function findPlayersByFirstName(firstName: string): Player[];
/**
 * Find players by last name.
 * @param lastName - Last name to match (case-insensitive)
 */
export declare function findPlayersByLastName(lastName: string): Player[];
/**
 * Get all players.
 */
export declare function getPlayers(): Player[];
/**
 * Get all active players.
 */
export declare function getActivePlayers(): Player[];
/**
 * Get all inactive (historical) players.
 */
export declare function getInactivePlayers(): Player[];
/**
 * Get all player IDs.
 */
export declare function getPlayerIds(): number[];
//# sourceMappingURL=players.d.ts.map