/**
 * NBA API Utilities
 *
 * HTTP client, file I/O, rate limiting, and response normalization.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { STATS_BASE_URL, LIVE_BASE_URL, STATS_HEADERS, LIVE_HEADERS, DEFAULTS, } from './config.js';
// =============================================================================
// HTTP Client Factory
// =============================================================================
/**
 * Create a Tier 1 HTTP client using native fetch with proper headers.
 */
export function createFetchClient(headers = STATS_HEADERS) {
    return {
        async get(url, options) {
            const controller = new AbortController();
            const timeout = options?.timeout ?? DEFAULTS.TIMEOUT;
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers,
                    signal: controller.signal,
                });
                return response;
            }
            finally {
                clearTimeout(timeoutId);
            }
        },
    };
}
/**
 * Create a Tier 2 HTTP client using Puppeteer with stealth plugin.
 * This is used as a fallback when native fetch fails due to anti-bot measures.
 */
export async function createPuppeteerClient() {
    // Dynamic import to make puppeteer optional
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let puppeteerModule;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let stealthPluginModule;
    try {
        puppeteerModule = await import('puppeteer-extra');
        stealthPluginModule = await import('puppeteer-extra-plugin-stealth');
    }
    catch {
        throw new Error('Puppeteer is not installed. Install puppeteer-extra and puppeteer-extra-plugin-stealth for Tier 2 client support.');
    }
    const puppeteer = puppeteerModule.default ?? puppeteerModule;
    const StealthPlugin = stealthPluginModule.default ?? stealthPluginModule;
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    return {
        async get(url) {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            // Extract JSON from page (NBA API returns JSON in pre tag or body)
            const bodyText = await page.evaluate(() => {
                const pre = document.querySelector('pre');
                if (pre)
                    return pre.textContent ?? '';
                return document.body.textContent ?? '';
            });
            return bodyText;
        },
        async close() {
            await page.close();
            await browser.close();
        },
    };
}
// =============================================================================
// Main Fetch Functions
// =============================================================================
/**
 * Fetch data from NBA Stats API with tiered client fallback.
 */
export async function fetchStats(endpoint, params = {}, options = {}) {
    const { timeout = DEFAULTS.TIMEOUT, clientTier = 'tier1', headers = STATS_HEADERS } = options;
    // Build URL with parameters
    const url = new URL(`${STATS_BASE_URL}/${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.append(key, String(value));
        }
    }
    // Sort parameters alphabetically
    const sortedParams = new URLSearchParams([...url.searchParams.entries()].sort((a, b) => a[0].localeCompare(b[0])));
    const fullUrl = `${STATS_BASE_URL}/${endpoint}?${sortedParams.toString()}`;
    const tiers = clientTier === 'auto' ? ['tier1', 'tier2'] : [clientTier];
    let lastError = null;
    for (const tier of tiers) {
        try {
            if (tier === 'tier1') {
                const client = createFetchClient(headers);
                const response = await client.get(fullUrl, { timeout });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                }
                catch {
                    throw new Error(`Invalid JSON response from ${endpoint}`);
                }
                return {
                    url: fullUrl,
                    statusCode: response.status,
                    data: normalizeResponse(data),
                    raw: data,
                };
            }
            else if (tier === 'tier2') {
                const client = await createPuppeteerClient();
                try {
                    const text = await client.get(fullUrl);
                    let data;
                    try {
                        data = JSON.parse(text);
                    }
                    catch {
                        throw new Error(`Invalid JSON response from ${endpoint}`);
                    }
                    return {
                        url: fullUrl,
                        statusCode: 200,
                        data: normalizeResponse(data),
                        raw: data,
                    };
                }
                finally {
                    await client.close();
                }
            }
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            // If we have more tiers to try, continue
            if (tiers.indexOf(tier) < tiers.length - 1) {
                continue;
            }
        }
    }
    throw lastError ?? new Error(`Failed to fetch ${endpoint}`);
}
/**
 * Fetch data from NBA Live API.
 */
export async function fetchLive(endpoint, options = {}) {
    const { timeout = DEFAULTS.TIMEOUT, gameId, headers = LIVE_HEADERS } = options;
    let path = endpoint;
    if (gameId) {
        path = path.replace('{game_id}', gameId);
    }
    const fullUrl = `${LIVE_BASE_URL}/${path}`;
    const client = createFetchClient(headers);
    const response = await client.get(fullUrl, { timeout });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    }
    catch {
        throw new Error(`Invalid JSON response from ${endpoint}`);
    }
    return {
        url: fullUrl,
        statusCode: response.status,
        data,
        raw: data,
    };
}
// =============================================================================
// Response Normalization
// =============================================================================
/**
 * Normalize NBA Stats API response from tabular format to named object arrays.
 * Converts resultSets with headers/rowSet to arrays of objects with named properties.
 */
export function normalizeResponse(raw) {
    const normalized = {};
    // Handle resultSets (array of result sets)
    if (raw.resultSets && Array.isArray(raw.resultSets)) {
        for (const resultSet of raw.resultSets) {
            normalized[resultSet.name] = normalizeResultSet(resultSet);
        }
        return normalized;
    }
    // Handle resultSet (single result set or array)
    if (raw.resultSet) {
        const resultSets = Array.isArray(raw.resultSet) ? raw.resultSet : [raw.resultSet];
        for (const resultSet of resultSets) {
            normalized[resultSet.name] = normalizeResultSet(resultSet);
        }
        return normalized;
    }
    // Return as-is if not in expected format
    return normalized;
}
/**
 * Convert a single result set with headers and rowSet to array of objects.
 */
function normalizeResultSet(resultSet) {
    const { headers, rowSet } = resultSet;
    const rows = [];
    for (const row of rowSet) {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header) {
                obj[header] = row[i];
            }
        }
        rows.push(obj);
    }
    return rows;
}
/**
 * Convert column name from NBA's UPPER_SNAKE_CASE to camelCase.
 */
export function toCamelCase(str) {
    return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * Convert an object's keys from UPPER_SNAKE_CASE to camelCase.
 * Preserves the type structure with camelCase keys.
 */
export function normalizeKeys(obj) {
    const normalized = {};
    for (const [key, value] of Object.entries(obj)) {
        normalized[toCamelCase(key)] = value;
    }
    return normalized;
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
export function writeToFile(data, filepath, format) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const detectedFormat = format === 'auto' || !format
        ? filepath.endsWith('.csv')
            ? 'csv'
            : 'json'
        : format;
    if (detectedFormat === 'csv') {
        const csvContent = toCSV(data);
        fs.writeFileSync(filepath, csvContent, 'utf-8');
    }
    else {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    }
}
/**
 * Read data from a JSON file.
 */
export function readFromFile(filepath) {
    if (!fs.existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    try {
        return JSON.parse(content);
    }
    catch {
        return content;
    }
}
/**
 * Convert data to CSV format.
 */
function toCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return '';
    }
    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) {
        return '';
    }
    const headers = Object.keys(firstItem);
    const lines = [headers.join(',')];
    for (const item of data) {
        if (typeof item === 'object' && item !== null) {
            const values = headers.map((header) => {
                const value = item[header];
                if (value === null || value === undefined) {
                    return '';
                }
                const strValue = String(value);
                // Escape values containing commas, quotes, or newlines
                if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                    return `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            });
            lines.push(values.join(','));
        }
    }
    return lines.join('\n');
}
// =============================================================================
// Rate Limiting
// =============================================================================
/**
 * Pause execution for a specified duration.
 * @param ms - Milliseconds to pause
 */
export function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Generate a random delay value between min and max.
 * @param min - Minimum milliseconds (default: 1000)
 * @param max - Maximum milliseconds (default: 3000)
 */
export function randomDelay(min = DEFAULTS.RATE_LIMIT_MIN_MS, max = DEFAULTS.RATE_LIMIT_MAX_MS) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Pause execution for a random duration.
 * @param min - Minimum milliseconds (default: 1000)
 * @param max - Maximum milliseconds (default: 3000)
 */
export async function randomPause(min = DEFAULTS.RATE_LIMIT_MIN_MS, max = DEFAULTS.RATE_LIMIT_MAX_MS) {
    const delay = randomDelay(min, max);
    await pause(delay);
}
// =============================================================================
// Logging
// =============================================================================
import winston from 'winston';
/**
 * Create a Winston logger instance.
 */
export function createLogger(level = 'INFO') {
    const winstonLevel = level === 'NONE'
        ? 'error'
        : level === 'WARNING'
            ? 'warn'
            : level.toLowerCase();
    return winston.createLogger({
        level: winstonLevel,
        format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })),
        transports: [new winston.transports.Console()],
        silent: level === 'NONE',
    });
}
// =============================================================================
// V3 Box Score Normalization
// =============================================================================
/**
 * Normalize V3 box score player data to match expected schema format.
 * V3 uses different field names: personId -> playerId, firstName+familyName -> playerName, etc.
 */
export function normalizeV3PlayerStats(player, team) {
    const stats = (player['statistics'] ?? {});
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
    };
}
/**
 * Normalize V3 box score team data to match expected schema format.
 */
export function normalizeV3TeamStats(team) {
    const stats = (team['statistics'] ?? {});
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
    };
}
/**
 * Normalize V3 advanced box score player data to match expected schema format.
 * Advanced stats have different fields: offensive/defensive rating, pace, PIE, etc.
 */
export function normalizeV3AdvancedPlayerStats(player, team) {
    const stats = (player['statistics'] ?? {});
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
    };
}
/**
 * Normalize V3 advanced box score team data to match expected schema format.
 */
export function normalizeV3AdvancedTeamStats(team) {
    const stats = (team['statistics'] ?? {});
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
    };
}
export class ProgressReporter {
    json;
    quiet;
    constructor(options = {}) {
        this.json = options.json ?? false;
        this.quiet = options.quiet ?? false;
    }
    logFetch(endpoint, params) {
        if (this.quiet)
            return;
        if (this.json) {
            console.log(JSON.stringify({ event: 'fetch', endpoint, params }));
        }
        else {
            const paramStr = params ? ` (${JSON.stringify(params)})` : '';
            console.log(`Fetching: ${endpoint}${paramStr}`);
        }
    }
    logSuccess(endpoint, filepath) {
        if (this.quiet)
            return;
        if (this.json) {
            console.log(JSON.stringify({ event: 'success', endpoint, filepath }));
        }
        else {
            const pathStr = filepath ? ` -> ${filepath}` : '';
            console.log(`  ✓ ${endpoint}${pathStr}`);
        }
    }
    logError(endpoint, error) {
        if (this.json) {
            console.log(JSON.stringify({ event: 'error', endpoint, error }));
        }
        else {
            console.error(`  ✗ ${endpoint}: ${error}`);
        }
    }
    logSkip(endpoint, reason) {
        if (this.quiet)
            return;
        if (this.json) {
            console.log(JSON.stringify({ event: 'skip', endpoint, reason }));
        }
        else {
            console.log(`  - ${endpoint}: ${reason}`);
        }
    }
    logInfo(message) {
        if (this.quiet)
            return;
        if (this.json) {
            console.log(JSON.stringify({ event: 'info', message }));
        }
        else {
            console.log(message);
        }
    }
    logHeader(title) {
        if (this.quiet)
            return;
        if (!this.json) {
            console.log(`\n=== ${title} ===\n`);
        }
    }
    logProgress(current, total, description) {
        if (this.quiet)
            return;
        if (this.json) {
            console.log(JSON.stringify({ event: 'progress', current, total, description }));
        }
        else {
            console.log(`[${current}/${total}] ${description}`);
        }
    }
}
//# sourceMappingURL=utils.js.map