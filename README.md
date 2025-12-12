# NBA Stats and Live API

[![npm version](https://img.shields.io/npm/v/nba-api.svg)](https://www.npmjs.com/package/nba-api)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/node/v/nba-api)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-207%20passing-brightgreen)](test/)
[![Coverage](https://img.shields.io/badge/coverage-92.84%25-brightgreen)](test/)

A TypeScript wrapper for [NBA Stats](https://stats.nba.com/) and [NBA Live](https://cdn.nba.com/) APIs with CLI support. Fetches real-time and historical NBA statistics using authenticated HTTP requests with automatic anti-bot bypass.

This service follows the data-collection architecture pattern with organized data storage, rate limiting, comprehensive logging, and CLI orchestration.

> **Note:** This project is under active development. APIs and CLI options may change between versions.

## Quick Start

### CLI Usage
```bash
# Install globally
npm install -g nba-api

# Get league leaders for current season
nba --league-leaders

# Get live scoreboard
nba --live-scoreboard
```

### Programmatic Usage
```typescript
import { NbaAPI } from 'nba-api'

const api = new NbaAPI()
await api.connect()

// Get LeBron James' career stats
const stats = await api.getPlayerCareerStats(2544)
console.log('Seasons:', stats.length)

// Get today's live scoreboard
const scoreboard = await api.getLiveScoreboard()
console.log('Games today:', scoreboard.games.length)

await api.close()
```

## Table of Contents

- [Overview](#overview)
- [Data Endpoints](#data-endpoints)
- [Installation](#installation)
- [CLI Usage](#cli-usage)
- [API Methods](#api-methods)
- [Static Data](#static-data)
- [Examples](#examples)
- [Data Organization](#data-organization)
- [HTTP Client Tiers](#http-client-tiers)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Troubleshooting](#troubleshooting)

## Overview

The NBA Stats API provides comprehensive basketball statistics from stats.nba.com and cdn.nba.com. This Node.js wrapper implements:

- **24+ Data Endpoints** - Player stats, team stats, league leaders, box scores, live games, odds, and more
- **Tiered HTTP Client** - Automatic fallback between native fetch and Puppeteer for anti-bot handling
- **Built-in Rate Limiting** - Random delays (1-3 seconds) between requests to avoid rate limiting
- **Response Normalization** - Converts NBA's tabular format to typed JavaScript objects with camelCase keys
- **Season Validation** - Validates season format and enforces valid ranges
- **CLI Tool** - Command-line interface with batch processing, season ranges, and dry-run mode
- **Static Data** - Pre-loaded player and team data for ID lookups without API calls
- **Comprehensive Testing** - 207 tests with 92.84% coverage

## Data Endpoints

### Player Endpoints
| Endpoint | Description |
|----------|-------------|
| Player Career Stats | Career totals, averages, per-36 stats by season |
| Player Game Log | Game-by-game stats for a season |
| Common Player Info | Bio, draft info, team, position |
| Common All Players | List of all players for a season |
| Player Estimated Metrics | Advanced metrics (OREB%, DREB%, USG%, etc.) |

### Team Endpoints
| Endpoint | Description |
|----------|-------------|
| Common Team Roster | Current roster with player details |
| Team Game Log | Game-by-game team stats for a season |
| Team Info Common | Team info, record, conference/division rank |
| Team Year-by-Year Stats | Historical stats across all seasons |

### League Endpoints
| Endpoint | Description |
|----------|-------------|
| League Leaders | Top players by stat category (PTS, REB, AST, etc.) |
| League Dash Player Stats | Comprehensive player stats with filters |
| League Standings | Conference and division standings |
| League Game Finder | Search games by criteria |
| League Game Log | All games for a season |

### Game Endpoints
| Endpoint | Description |
|----------|-------------|
| Scoreboard | Games and scores for a specific date |
| Box Score Traditional | Player and team stats for a game |
| Box Score Advanced | Advanced stats (ORtg, DRtg, TS%, etc.) |
| Play By Play | Play-by-play data for a game |
| Shot Chart Detail | Shot locations and results |

### Live API Endpoints
| Endpoint | Description |
|----------|-------------|
| Live Scoreboard | Today's games with real-time scores |
| Live Box Score | Real-time box score for a game |
| Live Play By Play | Real-time play-by-play |
| Live Odds | Today's betting odds |

### Other Endpoints
| Endpoint | Description |
|----------|-------------|
| Draft History | Draft picks by year |

## Installation

### Option 1: Install from npm

```bash
# Install globally for CLI usage
npm install -g nba-api

# Or install locally in your project
npm install nba-api
```

### Option 2: Install from source

```bash
# Clone the repository
git clone https://github.com/aself101/nba-api.git
cd nba-api

# Install dependencies
npm install

# Build
npm run build
```

Dependencies:
- `commander` - CLI argument parsing
- `winston` - Logging framework
- `zod` - Runtime type validation

Optional (for anti-bot bypass):
- `puppeteer-extra` - Browser automation
- `puppeteer-extra-plugin-stealth` - Stealth plugin

## CLI Usage

### Basic Command Structure

```bash
# Global install
nba [options]

# Local install (use npx)
npx nba-api [options]

# From source (development)
npm run nba -- [options]
```

### Category Flags

Fetch groups of endpoints at once:

```bash
--all                    # Fetch all stats endpoints
--all-player-endpoints   # Fetch all player endpoints
--all-team-endpoints     # Fetch all team endpoints
--all-league-endpoints   # Fetch all league endpoints
--live                   # Fetch all live endpoints
```

### Individual Endpoint Flags

```bash
# Player endpoints
--player-career          # Player career stats (requires --player-id)
--player-game-log        # Player game log (requires --player-id)
--player-info            # Player info (requires --player-id)
--all-players            # All players list
--player-metrics         # Player estimated metrics

# Team endpoints
--team-roster            # Team roster (requires --team-id)
--team-game-log          # Team game log (requires --team-id)
--team-info              # Team info (requires --team-id)
--team-history           # Team year-by-year stats (requires --team-id)

# League endpoints
--league-leaders         # League leaders
--league-dash-players    # League dashboard player stats
--standings              # League standings
--game-finder            # Game finder
--league-game-log        # League game log

# Game endpoints
--scoreboard             # Scoreboard for a date
--box-score              # Traditional box score (requires --game-id)
--box-score-advanced     # Advanced box score (requires --game-id)
--play-by-play           # Play by play (requires --game-id)

# Live endpoints
--live-scoreboard        # Today's live scoreboard
--live-box-score         # Live box score (requires --game-id)
--live-play-by-play      # Live play by play (requires --game-id)
--live-odds              # Today's odds

# Other endpoints
--shot-chart             # Shot chart (requires --player-id, --team-id optional)
--draft-history          # Draft history
```

### Parameters

```bash
--season <season>        # Season (YYYY-YY format, e.g., 2024-25)
--start-season <season>  # Start season for range
--end-season <season>    # End season for range
--player-id <id>         # Player ID (integer)
--team-id <id>           # Team ID (integer)
--game-id <id>           # Game ID (10 digits, e.g., 0022400123)
--game-date <date>       # Game date (YYYY-MM-DD)
--season-type <type>     # Season type (default: Regular Season)
--stat-category <stat>   # Stat category for leaders (default: PTS)
```

### Other Options

```bash
--output-dir <path>      # Output directory (default: datasets)
--log-level <level>      # DEBUG, INFO, WARNING, ERROR
--client <tier>          # HTTP client tier (tier1, tier2, auto)
--dry-run                # Preview without fetching
--examples               # Show usage examples
```

### Valid Stat Categories

`PTS`, `REB`, `AST`, `STL`, `BLK`, `FG_PCT`, `FG3_PCT`, `FT_PCT`, `EFF`, `AST_TOV`, `STL_TOV`

### Valid Season Types

`Regular Season`, `Playoffs`, `Pre Season`, `PlayIn`, `All Star`

## API Methods

### Core Methods

#### Constructor

```typescript
const api = new NbaAPI({
  logLevel: 'INFO',       // DEBUG, INFO, WARNING, ERROR, NONE
  timeout: 30000,         // Request timeout in milliseconds
  clientTier: 'auto',     // tier1, tier2, or auto
})
```

#### Connection Management

```typescript
// Initialize client (required for tier2)
await api.connect()

// Close connection when done
await api.close()

// Check connection status
console.log(api.connected)  // boolean
```

### Player Endpoints

#### `getPlayerCareerStats(playerId, options)`

Get player career statistics.

```typescript
const stats = await api.getPlayerCareerStats(2544, {
  perMode: 'PerGame',     // 'Totals', 'PerGame', 'Per36', 'Per48'
  leagueId: '00',         // '00' (NBA), '10' (WNBA), '20' (G-League)
})
// Returns: Array of season stats with 25+ columns including
// playerId, seasonId, teamAbbreviation, gamesPlayed, points, rebounds, assists, etc.
```

#### `getPlayerGameLog(playerId, season, seasonType)`

Get player game log for a season.

```typescript
const games = await api.getPlayerGameLog(2544, '2024-25', 'Regular Season')
// Returns: Array of games with gameId, gameDate, matchup, points, rebounds, assists, etc.
```

#### `getCommonPlayerInfo(playerId)`

Get player bio and information.

```typescript
const info = await api.getCommonPlayerInfo(2544)
// Returns: firstName, lastName, birthDate, height, weight, position, teamId, draftYear, etc.
```

#### `getCommonAllPlayers(season, isOnlyCurrentSeason)`

Get list of all players.

```typescript
const players = await api.getCommonAllPlayers('2024-25')
// Returns: Array of players with playerId, displayFirstLast, teamId, etc.
```

#### `getPlayerEstimatedMetrics(season)`

Get player advanced metrics.

```typescript
const metrics = await api.getPlayerEstimatedMetrics('2024-25')
// Returns: estimatedOffensiveRating, estimatedDefensiveRating, estimatedUsagePct, etc.
```

### Team Endpoints

#### `getCommonTeamRoster(teamId, season)`

Get team roster.

```typescript
const roster = await api.getCommonTeamRoster(1610612747, '2024-25')
// Returns: Array of players with playerId, player, position, height, weight, age, etc.
```

#### `getTeamGameLog(teamId, season, seasonType)`

Get team game log.

```typescript
const games = await api.getTeamGameLog(1610612747, '2024-25')
// Returns: Array of games with gameId, gameDate, matchup, winLoss, points, etc.
```

#### `getTeamInfoCommon(teamId, season)`

Get team information.

```typescript
const info = await api.getTeamInfoCommon(1610612747, '2024-25')
// Returns: teamCity, teamName, wins, losses, pct, confRank, divRank, etc.
```

#### `getTeamYearByYearStats(teamId)`

Get team historical statistics.

```typescript
const history = await api.getTeamYearByYearStats(1610612747)
// Returns: Array of seasons with year, wins, losses, playoffRound, points, rebounds, etc.
```

### League-Wide Endpoints

#### `getLeagueLeaders(season, statCategory)`

Get league leaders by stat category.

```typescript
const leaders = await api.getLeagueLeaders('2024-25', 'PTS')
// Returns: Array of players with rank, player, team, gamesPlayed, points, etc.
```

#### `getLeagueDashPlayerStats(options)`

Get comprehensive player statistics with filters.

```typescript
const stats = await api.getLeagueDashPlayerStats({
  season: '2024-25',
  seasonType: 'Regular Season',
  perMode: 'PerGame',
  conference: 'East',        // Optional: 'East' or 'West'
  division: 'Atlantic',      // Optional
  teamId: 1610612747,        // Optional
  outcome: 'W',              // Optional: 'W' or 'L'
  location: 'Home',          // Optional: 'Home' or 'Road'
  month: 0,                  // Optional: 1-12
  lastNGames: 10,            // Optional: last N games
})
// Returns: Array of players with 30+ stat columns
```

#### `getLeagueStandings(season, seasonType)`

Get league standings.

```typescript
const standings = await api.getLeagueStandings('2024-25')
// Returns: Array of teams with conference, division, wins, losses, record, streaks, etc.
```

#### `getLeagueGameFinder(options)`

Search for games matching criteria.

```typescript
const games = await api.getLeagueGameFinder({
  playerOrTeam: 'T',         // 'P' for player, 'T' for team
  season: '2024-25',
  teamId: 1610612747,
  outcome: 'W',
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
})
// Returns: Array of games matching criteria
```

#### `getLeagueGameLog(season, seasonType)`

Get all games for a season.

```typescript
const games = await api.getLeagueGameLog('2024-25')
// Returns: Array of all games with team stats
```

### Game Endpoints

#### `getScoreboard(gameDate)`

Get scoreboard for a date.

```typescript
const scoreboard = await api.getScoreboard('2025-01-15')
// Returns: { gameDate, leagueId, games: [...] }
```

#### `getBoxScoreTraditional(gameId)`

Get traditional box score.

```typescript
const box = await api.getBoxScoreTraditional('0022400123')
// Returns: { gameId, playerStats: [...], teamStats: [...] }
```

#### `getBoxScoreAdvanced(gameId)`

Get advanced box score.

```typescript
const box = await api.getBoxScoreAdvanced('0022400123')
// Returns: Advanced stats including offensiveRating, defensiveRating, pace, etc.
```

#### `getPlayByPlay(gameId)`

Get play-by-play data.

```typescript
const plays = await api.getPlayByPlay('0022400123')
// Returns: Array of plays with eventNum, period, clock, description, score, etc.
```

#### `getShotChartDetail(options)`

Get shot chart data.

```typescript
const shots = await api.getShotChartDetail({
  playerId: 2544,           // Required
  teamId: 1610612747,       // Optional (defaults to 0 for all teams)
  season: '2024-25',        // Optional (defaults to current season)
  seasonType: 'Regular Season',  // Optional
  gameId: '',               // Optional - filter to specific game
  contextMeasure: 'FGA',    // Optional - 'FGA', 'FGM', 'FG3A', etc.
})
// Returns: Array of shots with locX, locY, shotType, shotZone, shotMadeFlag, etc.
```

### Live API Endpoints

#### `getLiveScoreboard()`

Get today's live scoreboard.

```typescript
const live = await api.getLiveScoreboard()
// Returns: { gameDate, games: [...] } with real-time scores
```

#### `getLiveBoxScore(gameId)`

Get live box score.

```typescript
const box = await api.getLiveBoxScore('0022400123')
// Returns: Real-time player and team stats
```

#### `getLivePlayByPlay(gameId)`

Get live play-by-play.

```typescript
const plays = await api.getLivePlayByPlay('0022400123')
// Returns: Real-time play-by-play actions
```

#### `getLiveOdds()`

Get today's betting odds.

```typescript
const odds = await api.getLiveOdds()
// Returns: { games: [...] } with spreads and odds from multiple books
```

### Other Endpoints

#### `getDraftHistory(season)`

Get draft history.

```typescript
const draft = await api.getDraftHistory(2024)
// Returns: Array of picks with playerId, playerName, roundNumber, overallPick, team, etc.
```

## Static Data

Access pre-loaded player and team data without API calls:

### Player Lookups

```typescript
import {
  players,
  findPlayerById,
  findPlayersByName,
  findPlayersByFirstName,
  findPlayersByLastName,
  getPlayers,
  getPlayerIds,
  getActivePlayers,
  getInactivePlayers,
} from 'nba-api'

// Find player by ID
const lebron = findPlayerById(2544)
// { id: 2544, fullName: 'LeBron James', firstName: 'LeBron', lastName: 'James', isActive: true }

// Search players by name (case-insensitive partial match)
const currys = findPlayersByName('Curry')
// Returns all players with 'Curry' in their name

// Search by first or last name specifically
const stephens = findPlayersByFirstName('Stephen')
const jameses = findPlayersByLastName('James')

// Get all players as array
const allPlayers = getPlayers()  // Returns 5103+ players

// Get all player IDs (useful for bulk operations)
const playerIds = getPlayerIds()

// Get all active players
const active = getActivePlayers()

// Get retired/inactive players
const retired = getInactivePlayers()

// Access full player array directly
console.log(`Total players: ${players.length}`)
```

### Team Lookups

```typescript
import {
  teams,
  findTeamById,
  findTeamByAbbreviation,
  findTeamsByName,
  findTeamsByCity,
  findTeamsByState,
  getTeams,
  getTeamAbbreviations,
  getTeamIds,
} from 'nba-api'

// Find team by ID
const lakers = findTeamById(1610612747)
// { id: 1610612747, fullName: 'Los Angeles Lakers', abbreviation: 'LAL', nickname: 'Lakers', city: 'Los Angeles', state: 'CA', yearFounded: 1947 }

// Find by abbreviation
const celtics = findTeamByAbbreviation('BOS')

// Search by name
const lakersSearch = findTeamsByName('Lakers')

// Find by location
const caTeams = findTeamsByState('California')  // Warriors, Lakers, Clippers, Kings
const nyTeams = findTeamsByCity('New York')     // Knicks

// Get all teams as array
const allTeams = getTeams()  // Returns all 30 NBA teams

// Get all team abbreviations (useful for validation)
const abbreviations = getTeamAbbreviations()
// ['ATL', 'BOS', 'BKN', 'CHA', 'CHI', ...]

// Get all team IDs (useful for bulk operations)
const teamIds = getTeamIds()

// Access full team array directly
console.log(`Total teams: ${teams.length}`)
```

## Examples

### Example 1: Get Current Season Leaders

```bash
nba --league-leaders
```

```typescript
import { NbaAPI } from 'nba-api'

const api = new NbaAPI()
await api.connect()

const leaders = await api.getLeagueLeaders()
console.log('Top 5 Scorers:')
leaders.slice(0, 5).forEach((p, i) => {
  console.log(`${i + 1}. ${p.player} (${p.team}): ${p.points} PPG`)
})

await api.close()
```

### Example 2: Player Career Summary

```bash
nba --player-career --player-id 2544
nba --player-info --player-id 2544
```

```typescript
const api = new NbaAPI()
await api.connect()

// Get LeBron's career stats
const career = await api.getPlayerCareerStats(2544)
const totals = career.reduce(
  (acc, s) => ({
    games: acc.games + s.gamesPlayed,
    points: acc.points + s.points,
    rebounds: acc.rebounds + s.rebounds,
    assists: acc.assists + s.assists,
  }),
  { games: 0, points: 0, rebounds: 0, assists: 0 }
)

console.log(`LeBron Career: ${totals.games} games, ${totals.points} pts`)

await api.close()
```

### Example 3: Live Game Tracking

```bash
nba --live-scoreboard
nba --live-box-score --game-id 0022400123
```

```typescript
const api = new NbaAPI()
await api.connect()

// Get today's games
const live = await api.getLiveScoreboard()

for (const game of live.games) {
  const { homeTeam, awayTeam, gameStatusText } = game
  console.log(
    `${awayTeam.teamTricode} ${awayTeam.score} @ ${homeTeam.teamTricode} ${homeTeam.score} - ${gameStatusText}`
  )
}

await api.close()
```

### Example 4: Team Season Analysis

```bash
nba --team-game-log --team-id 1610612747 --season 2024-25
```

```typescript
const api = new NbaAPI()
await api.connect()

const games = await api.getTeamGameLog(1610612747, '2024-25')

const wins = games.filter((g) => g.winLoss === 'W').length
const losses = games.filter((g) => g.winLoss === 'L').length
const avgPoints = games.reduce((sum, g) => sum + g.points, 0) / games.length

console.log(`Lakers 2024-25: ${wins}-${losses}, ${avgPoints.toFixed(1)} PPG`)

await api.close()
```

### Example 5: Historical Data Collection

```bash
# Fetch standings for 5 seasons
nba --standings --start-season 2020-21 --end-season 2024-25
```

### Example 6: Dry Run Preview

```bash
nba --all --season 2024-25 --dry-run
```

Output:
```
=== DRY RUN ===

Would fetch the following:
  Seasons: 2024-25

Endpoints:
  - Player Career Stats
  - Player Game Log
  - Player Info
  - All Players
  - Player Estimated Metrics
  - Team Roster
  - Team Game Log
  ...
```

## Data Organization

Data is saved to `datasets/` by default, organized by category:

```
datasets/
├── nba/
│   ├── live/
│   │   ├── scoreboard.json
│   │   ├── odds.json
│   │   ├── boxscore_0022400123.json
│   │   └── playbyplay_0022400123.json
│   ├── player/
│   │   └── 2544/
│   │       ├── career.json
│   │       ├── info.json
│   │       └── gamelog_2024-25.json
│   ├── players/
│   │   ├── all_players_2024-25.json
│   │   └── metrics_2024-25.json
│   ├── team/
│   │   └── 1610612747/
│   │       ├── roster_2024-25.json
│   │       ├── gamelog_2024-25.json
│   │       ├── info_2024-25.json
│   │       └── history.json
│   ├── league/
│   │   ├── leaders_PTS_2024-25.json
│   │   ├── dash_players_2024-25.json
│   │   ├── standings_2024-25.json
│   │   └── gamelog_2024-25.json
│   ├── boxscore/
│   │   ├── traditional_0022400123.json
│   │   └── advanced_0022400123.json
│   ├── playbyplay/
│   │   └── pbp_0022400123.json
│   ├── shotchart/
│   │   └── player_2544_2024-25.json
│   ├── scoreboard/
│   │   └── scoreboard_2025-01-15.json
│   └── draft/
│       └── draft_2024.json
```

**Data Format:**

All data is saved as JSON with normalized camelCase keys:

```json
[
  {
    "playerId": 2544,
    "seasonId": "2024-25",
    "teamAbbreviation": "LAL",
    "gamesPlayed": 50,
    "points": 1350,
    "rebounds": 400,
    "assists": 450
  }
]
```

## HTTP Client Tiers

The API uses a tiered approach to handle rate limiting and anti-bot measures:

### Tier 1: Native Fetch (Default)

- Uses native Node.js fetch with proper headers
- Fast performance, no browser overhead
- Works for most endpoints

### Tier 2: Headless Browser with Stealth

- Full Puppeteer browser automation
- Stealth plugin to avoid detection
- Falls back automatically if Tier 1 fails

### Configuration

```bash
# Tier 1 only (default)
nba --league-leaders --client tier1

# Tier 2 only (puppeteer)
nba --league-leaders --client tier2

# Auto mode - tries Tier 1 first, falls back to Tier 2
nba --league-leaders --client auto
```

```typescript
// Tier 1 (default)
const api = new NbaAPI({ clientTier: 'tier1' })

// Tier 2 (puppeteer)
const api = new NbaAPI({ clientTier: 'tier2' })

// Auto fallback
const api = new NbaAPI({ clientTier: 'auto' })
```

## Error Handling

### Parameter Validation

```typescript
try {
  // Invalid player ID
  await api.getPlayerCareerStats(-1)
} catch (error) {
  // "Invalid player ID: -1. Must be a positive integer."
}

try {
  // Invalid season format
  await api.getLeagueLeaders('2024')
} catch (error) {
  // "Invalid season format: 2024. Expected format: YYYY-YY (e.g., 2024-25)"
}

try {
  // Invalid game ID
  await api.getBoxScoreTraditional('123')
} catch (error) {
  // "Invalid game ID: 123. Must be a 10-digit string (e.g., "0022400001")."
}
```

### Connection Management

```typescript
const api = new NbaAPI()

try {
  await api.connect()
  const stats = await api.getPlayerCareerStats(2544)
  // ... use stats
} catch (error) {
  console.error('API error:', error.message)
} finally {
  await api.close()  // Always close the connection
}
```

### Not Found Errors

```typescript
try {
  await api.getCommonPlayerInfo(999999)
} catch (error) {
  // "Player not found: 999999"
}
```

## TypeScript Support

This package is written in TypeScript and provides full type definitions out of the box. No additional `@types` packages are required.

### Type Imports

```typescript
import { NbaAPI } from 'nba-api'
import type {
  // API Options
  NbaAPIOptions,
  LogLevel,
  ClientTier,

  // Static Data Types
  Player,
  Team,

  // Player Response Types
  PlayerCareerStats,
  PlayerGameLog,
  CommonPlayerInfo,
  PlayerSummary,
  PlayerEstimatedMetrics,

  // Team Response Types
  TeamRoster,
  TeamGameLog,
  TeamInfoCommon,
  TeamYearByYearStats,

  // League Response Types
  LeagueLeader,
  LeagueDashPlayerStats,
  LeagueStanding,
  GameFinderResult,
  LeagueGameLogEntry,

  // Game Response Types
  Scoreboard,
  BoxScoreTraditional,
  BoxScoreAdvanced,
  PlayByPlayAction,
  ShotChartShot,
  DraftHistoryEntry,

  // Live Response Types
  LiveScoreboard,
  LiveBoxScore,
  LivePlayByPlay,
  LiveOdds,

  // Option Types
  PlayerCareerOptions,
  LeagueDashOptions,
  GameFinderOptions,
  ShotChartOptions,
} from 'nba-api'
```

### Submodule Exports

Type-safe access to configuration and utilities:

```typescript
// Configuration constants and validators
import {
  SeasonType,
  PerMode,
  LeagueID,
  StatCategory,
  Conference,
  Division,
  getCurrentSeason,
  validateSeason,
  validatePlayerId,
  validateTeamId,
  validateGameId,
  formatSeason,
  generateSeasonRange,
} from 'nba-api/config'

// Utility functions
import {
  writeToFile,
  readFromFile,
  pause,
  randomPause,
} from 'nba-api/utils'

// Static data
import { players, findPlayerById } from 'nba-api/data/players'
import { teams, findTeamById } from 'nba-api/data/teams'

// Zod validation schemas (for runtime type validation)
import {
  PlayerCareerStatsSchema,
  LeagueLeaderSchema,
  BoxScorePlayerStatsSchema,
  parseArraySafe,  // Helper for graceful validation with fallback
} from 'nba-api/schemas'

// Type definitions only
import type { Player, Team, LogLevel } from 'nba-api/types'
```

### Typed API Methods

All API methods return properly typed data:

```typescript
const api = new NbaAPI()
await api.connect()

// Returns PlayerCareerStats[]
const career = await api.getPlayerCareerStats(2544)
career[0].points        // number
career[0].seasonId      // string
career[0].gamesPlayed   // number

// Returns LeagueStanding[]
const standings = await api.getLeagueStandings('2024-25')
standings[0].teamName   // string
standings[0].wins       // number
standings[0].conference // string

// Returns LiveScoreboard
const live = await api.getLiveScoreboard()
live.games[0].homeTeam.score  // number
live.games[0].gameStatusText  // string

await api.close()
```

## Troubleshooting

### Rate Limiting / 403 Errors

```
Error: HTTP 403: Forbidden
```

**Solution:**
1. Add delays between requests
2. Try using Tier 2 client: `--client tier2`
3. Wait a few minutes and try again

### Invalid Season Format

```
Error: Invalid season format: 2024. Expected format: YYYY-YY (e.g., 2024-25)
```

**Solution:** Use the correct format:
```bash
nba --standings --season 2024-25  # Correct
nba --standings --season 2024     # Wrong
```

### Missing Required Parameter

```
Error: --player-id is required for player endpoints
```

**Solution:** Provide the required parameter:
```bash
nba --player-career --player-id 2544
```

### Tier 2 Not Available

```
Error: Puppeteer is not installed...
```

**Solution:** Install optional dependencies:
```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth
```

### Invalid Game ID

```
Error: Invalid game ID: 12345. Must be a 10-digit string...
```

**Solution:** Use the full 10-digit game ID:
```bash
nba --box-score --game-id 0022400123  # Correct
nba --box-score --game-id 12345       # Wrong
```

### V3 Endpoints Return Empty Data

Some NBA Stats API V3 endpoints use a non-standard response format that differs from the typical `resultSets` structure. If you're developing with this package and encounter empty data from endpoints like `scoreboardv3`, `boxscoretraditionalv3`, or `boxscoreadvancedv3`, the response format may have changed.

**V3 Response Format:**
```json
{
  "boxScoreTraditional": {
    "gameId": "...",
    "homeTeam": { "players": [...] },
    "awayTeam": { "players": [...] }
  }
}
```

**Standard Format (most endpoints):**
```json
{
  "resultSets": [
    { "name": "PlayerStats", "headers": [...], "rowSet": [[...]] }
  ]
}
```

**Solution:** When adding new V3 endpoints or debugging empty responses, use the `returnRaw: true` option in `_fetchStats()` to bypass `normalizeResponse()` and parse the nested structure manually. See `CLAUDE.md` for detailed patterns.

### Play-by-Play V3 Returns HTTP 500

The `playbyplayv3` endpoint on stats.nba.com returns HTTP 500 errors. This package uses the legacy `playbyplay` endpoint instead, which works reliably.

If you encounter HTTP 500 errors from play-by-play:
1. The legacy endpoint should work - ensure you're using the latest version of this package
2. Use `--live-play-by-play` for games currently in progress (uses the more reliable Live API)
3. Try again later - the NBA API can be intermittently unavailable

## Development

### Running from Source

```bash
# Clone repository
git clone https://github.com/aself101/nba-api.git
cd nba-api

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run CLI from source
npm run nba -- --examples
npm run nba -- --league-leaders --dry-run
```

### Testing

```bash
npm test                  # Run all 207 tests with Vitest
npm run test:watch        # Watch mode for development
npm run test:coverage     # Generate coverage report
```

**Test Coverage:**
- Overall: 92.84% lines, 80.43% branches
- api.ts: 97.38% lines (API methods)
- config.ts: 89.67% lines (validation, configuration)
- schemas.ts: 96.25% lines (Zod schema validation)
- utils.ts: 86.40% lines (HTTP clients, file I/O)

### npm Scripts

```bash
npm run build              # Compile TypeScript
npm run nba-api            # Run CLI
npm run nba-api:help       # Show help
npm run nba-api:examples   # Show examples
npm run lint               # Type check with tsc
npm run clean              # Remove build artifacts
```

## Rate Limits

The NBA Stats API does not publish official rate limits. The service includes:

- Random delays (1-3 seconds) between requests
- Automatic retry with tiered fallback
- Dry-run mode to preview operations

**Recommendation:** When fetching large amounts of data, use the `--dry-run` flag first to preview operations, and consider running during off-peak hours.

## Common Player/Team IDs

### Notable Player IDs
```typescript
const LEBRON_JAMES = 2544
const STEPHEN_CURRY = 201939
const KEVIN_DURANT = 201142
const GIANNIS_ANTETOKOUNMPO = 203507
const LUKA_DONCIC = 1629029
const NIKOLA_JOKIC = 203999
const JAYSON_TATUM = 1628369
const ANTHONY_EDWARDS = 1630162
```

### Team IDs
```typescript
const LAKERS = 1610612747
const CELTICS = 1610612738
const WARRIORS = 1610612744
const BULLS = 1610612741
const KNICKS = 1610612752
const NETS = 1610612751
const HEAT = 1610612748
const MAVERICKS = 1610612742
const NUGGETS = 1610612743
const BUCKS = 1610612749
```

## Related Packages

This package is part of the data-collection ecosystem. Check out these other sports data services:

- [`kenpom-api`](https://github.com/aself101/kenpom-api) - KenPom college basketball statistics wrapper
- [`cbb-data-api`](https://github.com/aself101/cbb-data-api) - College Basketball Data REST API wrapper

---

**Disclaimer:** This project is an independent community wrapper and is not affiliated with the NBA or stats.nba.com. Please respect rate limits and the site's terms of service.

### Responsible Use

This package includes built-in rate limiting (1-3 second delays between requests), but users are ultimately responsible for how they use this tool. Please:

- **Respect rate limits** - Avoid excessive requests that could burden the server
- **Use reasonably** - Fetch only the data you need, when you need it
- **Cache appropriately** - Store fetched data locally rather than re-fetching repeatedly
- **Follow terms of service** - Comply with NBA.com's usage policies

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
