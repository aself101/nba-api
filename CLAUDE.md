# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Repository Overview

TypeScript wrapper for NBA Stats (stats.nba.com) and NBA Live (cdn.nba.com) APIs with CLI support.

## Commands

```bash
# Build
npm run build

# Run tests
npm test                     # Run all 161 tests with Vitest
npm run test:watch           # Watch mode
npm run test:coverage        # Generate coverage report

# CLI usage (from source)
npm run nba-api -- --league-leaders
npm run nba-api -- --live-scoreboard
npm run nba-api -- --examples
npm run nba-api:help
```

## Architecture

### File Structure

- `src/api.ts` - Main `NbaAPI` class with all endpoint methods
- `src/cli.ts` - Commander-based CLI tool
- `src/config.ts` - Configuration, endpoints, parameter enums, validation functions
- `src/utils.ts` - HTTP clients (fetch, puppeteer), file I/O, rate limiting
- `src/types.ts` - TypeScript interfaces and Zod schemas
- `src/data/` - Static player and team data for ID lookups
- `test/` - Vitest tests for all modules

### Key Patterns

1. **Tiered HTTP Client**: `tier1` (native fetch) → `tier2` (puppeteer with stealth)
2. **Response Normalization**: `normalizeResponse()` converts NBA's `resultSets` format to named object arrays
3. **Rate Limiting**: Random delays (1-3 seconds) between requests via `randomPause()`
4. **Validation**: `validatePlayerId()`, `validateTeamId()`, `validateGameId()`, `validateSeason()`, `validateDate()`

## NBA API V3 Endpoints - Important Pattern

The NBA Stats API uses multiple API versions with different response formats. This is critical to understand when debugging empty data issues.

### Standard Format (most endpoints)

Most endpoints return data in `resultSets` format:
```json
{
  "resultSets": [
    { "name": "LeagueLeaders", "headers": [...], "rowSet": [[...], [...]] }
  ]
}
```

`normalizeResponse()` in `utils.ts` handles this format automatically.

### V3 Format (non-standard)

V3 endpoints return a **different nested structure** that `normalizeResponse()` doesn't handle:

| Endpoint | Response Format |
|----------|-----------------|
| `scoreboardv3` | `{ scoreboard: { games: [...] } }` |
| `boxscoretraditionalv3` | `{ boxScoreTraditional: { homeTeam: { players }, awayTeam: { players } } }` |
| `boxscoreadvancedv3` | `{ boxScoreAdvanced: { homeTeam: { players }, awayTeam: { players } } }` |
| `playbyplayv3` | Returns HTTP 500 (broken) - use legacy `playbyplay` instead |

### Debugging V3 Issues

**Symptom**: Endpoint returns empty array or 0 records despite API returning 200 OK.

**Cause**: `normalizeResponse()` returns `{}` for V3 format since it doesn't have `resultSets`.

**Solution**: Use `returnRaw: true` option in `_fetchStats()`:

```typescript
// In api.ts - for V3 endpoints that need raw response
const rawData = (await this._fetchStats(
  ENDPOINTS.SCOREBOARD,
  { GameDate: gameDate, LeagueID: '00' },
  { returnRaw: true }  // <-- This bypasses normalizeResponse()
)) as Record<string, unknown>

// Then parse the V3 structure manually
const scoreboard = rawData['scoreboard'] as Record<string, unknown>
const games = scoreboard['games'] as unknown[]
```

### Testing V3 Endpoints

To debug what format an endpoint returns:

```typescript
import { fetchStats } from './src/utils.js'

const response = await fetchStats('endpointName', { params })
console.log('Raw keys:', Object.keys(response.raw))
console.log('Normalized keys:', Object.keys(response.data))
// If normalized is empty but raw has data, it's a V3 format issue
```

## Common Issues

### Empty Data from V3 Endpoints

If `getScoreboard()`, `getBoxScoreTraditional()`, or `getBoxScoreAdvanced()` return empty arrays, check if the V3 response format changed. The raw response is available via `response.raw` in `fetchStats()`.

### playbyplayv3 Returns HTTP 500

The `playbyplayv3` endpoint is broken on NBA's side. Use the legacy `playbyplay` endpoint instead (configured in `config.ts`).

### Rate Limiting / 403 Errors

NBA Stats API aggressively rate limits. Solutions:
1. Built-in `randomPause()` adds 1-3 second delays
2. Use `--client tier2` for puppeteer with stealth mode
3. Wait and retry later

## Environment Variables

```bash
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

## Data Output

Default output directory: `datasets/nba/`

Organized by endpoint type: `player/`, `team/`, `league/`, `live/`, `boxscore/`, etc.
