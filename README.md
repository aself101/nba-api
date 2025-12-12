# nba-api

TypeScript wrapper for NBA Stats and Live APIs. Provides both programmatic access and a CLI tool for fetching NBA statistics data.

## Installation

```bash
npm install nba-api
```

For browser automation fallback (handles rate limiting):

```bash
npm install nba-api puppeteer-extra puppeteer-extra-plugin-stealth
```

## Quick Start

```typescript
import { NbaAPI } from 'nba-api'

const api = new NbaAPI()
await api.connect()

// Get LeBron James' career stats
const stats = await api.getPlayerCareerStats(2544)
console.log(stats)

// Get today's live scoreboard
const scoreboard = await api.getLiveScoreboard()
console.log(scoreboard)

await api.close()
```

## API Reference

### Constructor Options

```typescript
const api = new NbaAPI({
  logLevel: 'INFO',     // DEBUG, INFO, WARNING, ERROR, NONE
  timeout: 30000,       // Request timeout in ms
  clientTier: 'auto',   // 'tier1' (fetch), 'tier2' (puppeteer), 'auto'
})
```

### Player Endpoints

```typescript
// Career stats
const career = await api.getPlayerCareerStats(playerId, {
  perMode: 'PerGame',  // 'Totals', 'PerGame', 'Per36', 'Per48'
  leagueId: '00',      // '00' (NBA), '10' (WNBA), '20' (G-League)
})

// Game log for a season
const gameLog = await api.getPlayerGameLog(playerId, '2024-25', 'Regular Season')

// Player bio and info
const info = await api.getCommonPlayerInfo(playerId)

// All players list
const allPlayers = await api.getCommonAllPlayers('2024-25')

// Advanced metrics
const metrics = await api.getPlayerEstimatedMetrics('2024-25')
```

### Team Endpoints

```typescript
// Team roster
const roster = await api.getCommonTeamRoster(teamId, '2024-25')

// Team game log
const teamLog = await api.getTeamGameLog(teamId, '2024-25')

// Team info
const teamInfo = await api.getTeamInfoCommon(teamId)

// Year-by-year stats
const history = await api.getTeamYearByYearStats(teamId)
```

### League Endpoints

```typescript
// League leaders
const leaders = await api.getLeagueLeaders('2024-25', 'PTS')

// All player stats (dashboard)
const dashStats = await api.getLeagueDashPlayerStats('2024-25', {
  perMode: 'PerGame',
  seasonType: 'Regular Season',
})

// Standings
const standings = await api.getLeagueStandings('2024-25')

// Game finder
const games = await api.getLeagueGameFinder({
  playerOrTeam: 'T',
  season: '2024-25',
  teamId: 1610612747,
})

// League game log
const leagueLog = await api.getLeagueGameLog('2024-25')
```

### Game Endpoints

```typescript
// Scoreboard for a date
const scoreboard = await api.getScoreboard('2025-01-15')

// Box scores
const boxScore = await api.getBoxScoreTraditional('0022400123')
const advancedBox = await api.getBoxScoreAdvanced('0022400123')

// Play by play
const plays = await api.getPlayByPlay('0022400123')

// Shot chart
const shots = await api.getShotChartDetail(playerId, teamId, '2024-25')
```

### Live Endpoints

```typescript
// Today's scoreboard (real-time)
const live = await api.getLiveScoreboard()

// Live box score
const liveBox = await api.getLiveBoxScore('0022400123')

// Live play by play
const livePlays = await api.getLivePlayByPlay('0022400123')

// Today's odds
const odds = await api.getLiveOdds()
```

### Other Endpoints

```typescript
// Draft history
const draft = await api.getDraftHistory(2024)
```

## Static Data

Access pre-loaded player and team data without API calls:

```typescript
import { players, teams, findPlayerById, findTeamByAbbreviation } from 'nba-api'

// Find player by ID
const lebron = findPlayerById(2544)
// { id: 2544, fullName: 'LeBron James', firstName: 'LeBron', lastName: 'James', isActive: true }

// Find team by abbreviation
const lakers = findTeamByAbbreviation('LAL')
// { id: 1610612747, fullName: 'Los Angeles Lakers', abbreviation: 'LAL', ... }

// Search players by name
import { findPlayersByName } from 'nba-api'
const currys = findPlayersByName('Curry')

// Get active/inactive players
import { getActivePlayers, getInactivePlayers } from 'nba-api'
const active = getActivePlayers()
const retired = getInactivePlayers()

// Search teams
import { findTeamsByState, findTeamsByCity } from 'nba-api'
const caTeams = findTeamsByState('California')  // Warriors, Lakers, Clippers, Kings
const nyTeams = findTeamsByCity('New York')     // Knicks
```

## CLI Usage

```bash
# Get league leaders
nba-api --league-leaders --season 2024-25

# Get player career stats
nba-api --player-career --player-id 2544

# Get live scoreboard
nba-api --live-scoreboard

# Get team roster
nba-api --team-roster --team-id 1610612747 --season 2024-25

# Fetch all endpoints for a season
nba-api --all --season 2024-25

# Fetch multiple seasons
nba-api --league-leaders --start-season 2020 --end-season 2024

# Dry run (preview without fetching)
nba-api --all --season 2024-25 --dry-run

# Show examples
nba-api --examples
```

### CLI Options

```
Category Flags:
  --all                    Fetch all stats endpoints
  --all-player-endpoints   Fetch all player endpoints
  --all-team-endpoints     Fetch all team endpoints
  --all-league-endpoints   Fetch all league endpoints
  --live                   Fetch all live endpoints

Player Endpoints:
  --player-career          Player career stats
  --player-game-log        Player game log
  --player-info            Player info
  --all-players            All players list
  --player-metrics         Player estimated metrics

Team Endpoints:
  --team-roster            Team roster
  --team-game-log          Team game log
  --team-info              Team info
  --team-history           Team year-by-year stats

League Endpoints:
  --league-leaders         League leaders
  --league-dash-players    League dashboard player stats
  --standings              League standings
  --game-finder            Game finder
  --league-game-log        League game log

Game Endpoints:
  --scoreboard             Scoreboard for a date
  --box-score              Traditional box score
  --box-score-advanced     Advanced box score
  --play-by-play           Play by play

Live Endpoints:
  --live-scoreboard        Today's live scoreboard
  --live-box-score         Live box score
  --live-play-by-play      Live play by play
  --live-odds              Today's odds

Parameters:
  --season <season>        Season (YYYY-YY format, e.g., 2024-25)
  --start-season <year>    Start year for range
  --end-season <year>      End year for range
  --player-id <id>         Player ID
  --team-id <id>           Team ID
  --game-id <id>           Game ID (10 digits)
  --game-date <date>       Game date (YYYY-MM-DD)

Options:
  --output-dir <path>      Output directory (default: datasets)
  --log-level <level>      Log level (DEBUG, INFO, WARNING, ERROR)
  --client-tier <tier>     HTTP client tier (tier1, tier2, auto)
  --dry-run                Preview without fetching
  --quiet                  Suppress progress output
  --json                   Output progress as JSON
```

## Constants

```typescript
import { SeasonType, PerMode, LeagueID, StatCategory } from 'nba-api'

// Season types
SeasonType.REGULAR    // 'Regular Season'
SeasonType.PLAYOFFS   // 'Playoffs'
SeasonType.PRESEASON  // 'Pre Season'

// Per mode
PerMode.TOTALS        // 'Totals'
PerMode.PER_GAME      // 'PerGame'
PerMode.PER_36        // 'Per36'
PerMode.PER_48        // 'Per48'

// League IDs
LeagueID.NBA          // '00'
LeagueID.WNBA         // '10'
LeagueID.G_LEAGUE     // '20'

// Stat categories
StatCategory.PTS      // 'PTS'
StatCategory.REB      // 'REB'
StatCategory.AST      // 'AST'
```

## Common Player/Team IDs

```typescript
// Notable player IDs
const LEBRON_JAMES = 2544
const STEPHEN_CURRY = 201939
const KEVIN_DURANT = 201142
const GIANNIS = 203507
const LUKA_DONCIC = 1629029

// Team IDs
const LAKERS = 1610612747
const CELTICS = 1610612738
const WARRIORS = 1610612744
const BULLS = 1610612741
const KNICKS = 1610612752
```

## Error Handling

```typescript
try {
  const stats = await api.getPlayerCareerStats(invalidId)
} catch (error) {
  // Errors include helpful context:
  // "Invalid player ID: -1. Must be a positive integer."
  // "Player not found: 999999"
  // "Invalid season format: 2024. Expected format: YYYY-YY (e.g., 2024-25)"
}
```

## HTTP Client Tiers

The API uses a tiered HTTP client approach:

1. **Tier 1 (fetch)**: Fast native fetch with proper headers
2. **Tier 2 (puppeteer)**: Browser automation with stealth plugin for rate-limited requests

```typescript
// Force specific tier
const api = new NbaAPI({ clientTier: 'tier1' })  // fetch only
const api = new NbaAPI({ clientTier: 'tier2' })  // puppeteer only
const api = new NbaAPI({ clientTier: 'auto' })   // fallback (default)
```

## License

MIT
