/**
 * NBA API Utilities
 *
 * HTTP client, file I/O, rate limiting, and response normalization.
 */
import type { NbaResponse, NormalizedResponse, RawStatsResponse, ClientTier } from './types.js';
export interface FetchClient {
    get: (url: string, options?: {
        timeout?: number;
    }) => Promise<Response>;
}
export interface PuppeteerClient {
    get: (url: string) => Promise<string>;
    close: () => Promise<void>;
}
export type HttpClient = FetchClient | PuppeteerClient;
/**
 * Create a Tier 1 HTTP client using native fetch with proper headers.
 */
export declare function createFetchClient(headers?: Record<string, string>): FetchClient;
/**
 * Create a Tier 2 HTTP client using Puppeteer with stealth plugin.
 * This is used as a fallback when native fetch fails due to anti-bot measures.
 */
export declare function createPuppeteerClient(): Promise<PuppeteerClient>;
/**
 * Fetch data from NBA Stats API with tiered client fallback.
 */
export declare function fetchStats(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>, options?: {
    timeout?: number;
    clientTier?: ClientTier;
    headers?: Record<string, string>;
}): Promise<NbaResponse>;
/**
 * Fetch data from NBA Live API.
 */
export declare function fetchLive(endpoint: string, options?: {
    timeout?: number;
    gameId?: string;
    headers?: Record<string, string>;
}): Promise<NbaResponse>;
/**
 * Normalize NBA Stats API response from tabular format to named object arrays.
 * Converts resultSets with headers/rowSet to arrays of objects with named properties.
 */
export declare function normalizeResponse(raw: RawStatsResponse): NormalizedResponse;
/**
 * Convert column name from NBA's UPPER_SNAKE_CASE to camelCase.
 * @param str - String to convert (e.g., "PLAYER_ID")
 * @returns camelCase string (e.g., "playerId")
 */
export declare function toCamelCase(str: string): string;
/**
 * Lowercase a string type.
 * "ABC" -> "abc"
 */
type Lowercase<S extends string> = S extends `${infer C}${infer Rest}` ? `${C extends Uppercase<C> ? LowercaseChar<C> : C}${Lowercase<Rest>}` : S;
type LowercaseChar<C extends string> = C extends 'A' ? 'a' : C extends 'B' ? 'b' : C extends 'C' ? 'c' : C extends 'D' ? 'd' : C extends 'E' ? 'e' : C extends 'F' ? 'f' : C extends 'G' ? 'g' : C extends 'H' ? 'h' : C extends 'I' ? 'i' : C extends 'J' ? 'j' : C extends 'K' ? 'k' : C extends 'L' ? 'l' : C extends 'M' ? 'm' : C extends 'N' ? 'n' : C extends 'O' ? 'o' : C extends 'P' ? 'p' : C extends 'Q' ? 'q' : C extends 'R' ? 'r' : C extends 'S' ? 's' : C extends 'T' ? 't' : C extends 'U' ? 'u' : C extends 'V' ? 'v' : C extends 'W' ? 'w' : C extends 'X' ? 'x' : C extends 'Y' ? 'y' : C extends 'Z' ? 'z' : C;
/**
 * Uppercase the first character of a string type.
 * "abc" -> "Abc"
 */
type UppercaseFirst<S extends string> = S extends `${infer C}${infer Rest}` ? `${Uppercase<C>}${Rest}` : S;
/**
 * Convert UPPER_SNAKE_CASE to camelCase at the type level.
 * "PLAYER_ID" -> "playerId"
 * "TEAM_ABBREVIATION" -> "teamAbbreviation"
 */
type SnakeToCamel<S extends string> = S extends `${infer First}_${infer Rest}` ? `${Lowercase<First>}${SnakeToCamelRest<Rest>}` : Lowercase<S>;
type SnakeToCamelRest<S extends string> = S extends `${infer First}_${infer Rest}` ? `${UppercaseFirst<Lowercase<First>>}${SnakeToCamelRest<Rest>}` : UppercaseFirst<Lowercase<S>>;
/**
 * Convert all keys in an object from UPPER_SNAKE_CASE to camelCase.
 */
export type NormalizedKeys<T> = {
    [K in keyof T as K extends string ? SnakeToCamel<K> : K]: T[K];
};
/**
 * Convert an object's keys from UPPER_SNAKE_CASE to camelCase.
 * Preserves the type structure with camelCase keys.
 */
export declare function normalizeKeys<T extends Record<string, unknown>>(obj: T): NormalizedKeys<T>;
/**
 * Write data to a file with automatic directory creation.
 * @param data - Data to write
 * @param filepath - Output file path
 * @param format - Output format ('json' or 'csv', auto-detected from extension if not specified)
 */
export declare function writeToFile(data: unknown, filepath: string, format?: 'json' | 'csv' | 'auto'): void;
/**
 * Read data from a JSON file.
 * @param filepath - Path to the file to read
 * @returns Parsed JSON data, or raw string if JSON parsing fails
 * @throws Error if file does not exist
 */
export declare function readFromFile(filepath: string): unknown;
/**
 * Pause execution for a specified duration.
 * @param ms - Milliseconds to pause
 */
export declare function pause(ms: number): Promise<void>;
/**
 * Generate a random delay value between min and max.
 * @param min - Minimum milliseconds (default: 1000)
 * @param max - Maximum milliseconds (default: 3000)
 */
export declare function randomDelay(min?: number, max?: number): number;
/**
 * Pause execution for a random duration.
 * @param min - Minimum milliseconds (default: 1000)
 * @param max - Maximum milliseconds (default: 3000)
 */
export declare function randomPause(min?: number, max?: number): Promise<void>;
import winston from 'winston';
import type { LogLevel } from './types.js';
/**
 * Create a Winston logger instance with formatted output.
 * @param level - Log level: 'DEBUG', 'INFO', 'WARNING', 'ERROR', or 'NONE'
 * @returns Configured Winston logger instance
 */
export declare function createLogger(level?: LogLevel): winston.Logger;
/**
 * Normalize V3 box score player data to match expected schema format.
 * V3 uses different field names: personId -> playerId, firstName+familyName -> playerName, etc.
 */
export declare function normalizeV3PlayerStats(player: Record<string, unknown>, team: Record<string, unknown>): Record<string, unknown>;
/**
 * Normalize V3 box score team data to match expected schema format.
 */
export declare function normalizeV3TeamStats(team: Record<string, unknown>): Record<string, unknown>;
/**
 * Normalize V3 advanced box score player data to match expected schema format.
 * Advanced stats have different fields: offensive/defensive rating, pace, PIE, etc.
 */
export declare function normalizeV3AdvancedPlayerStats(player: Record<string, unknown>, team: Record<string, unknown>): Record<string, unknown>;
/**
 * Normalize V3 advanced box score team data to match expected schema format.
 */
export declare function normalizeV3AdvancedTeamStats(team: Record<string, unknown>): Record<string, unknown>;
/**
 * Options for the ProgressReporter class.
 */
export interface ProgressReporterOptions {
    /** Output progress as JSON instead of human-readable format */
    json?: boolean;
    /** Suppress all output */
    quiet?: boolean;
}
/**
 * CLI progress reporter for displaying fetch operations status.
 * Supports both human-readable and JSON output formats.
 *
 * **Why console.log instead of winston:**
 * This class intentionally uses `console.log` instead of the winston logger because:
 * 1. CLI tools need direct stdout control for proper piping and formatting
 * 2. Users expect formatted progress output, not timestamped log levels
 * 3. Winston is reserved for library-internal debug/error logging only
 * 4. JSON mode requires raw stdout for machine parsing (no log prefixes)
 *
 * @example
 * ```typescript
 * const reporter = new ProgressReporter({ quiet: false })
 * reporter.logHeader('Fetching Data')
 * reporter.logFetch('leagueLeaders', { season: '2024-25' })
 * reporter.logSuccess('leagueLeaders', '/path/to/file.json')
 * ```
 */
export declare class ProgressReporter {
    private json;
    private quiet;
    constructor(options?: ProgressReporterOptions);
    logFetch(endpoint: string, params?: Record<string, unknown>): void;
    logSuccess(endpoint: string, filepath?: string): void;
    logError(endpoint: string, error: string): void;
    logSkip(endpoint: string, reason: string): void;
    logInfo(message: string): void;
    logHeader(title: string): void;
    logProgress(current: number, total: number, description: string): void;
}
export {};
//# sourceMappingURL=utils.d.ts.map