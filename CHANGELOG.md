# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-11

### Added

- Initial release of nba-api
- **24+ API Endpoints**
  - Player endpoints: career stats, game log, player info, all players, estimated metrics
  - Team endpoints: roster, game log, team info, year-by-year stats
  - League endpoints: leaders, dashboard player stats, standings, game finder, game log
  - Game endpoints: scoreboard, box score (traditional & advanced), play-by-play, shot chart
  - Live endpoints: scoreboard, box score, play-by-play, odds
  - Other: draft history
- **CLI Tool** (`nba-api`)
  - Category flags for batch fetching (`--all`, `--all-player-endpoints`, etc.)
  - Individual endpoint flags with required parameters
  - Season range support (`--start-season`, `--end-season`)
  - Dry-run mode for previewing operations
  - Configurable output directory and log levels
- **Static Data**
  - Pre-loaded 5103 NBA players (historical and current)
  - Pre-loaded 30 NBA teams
  - Lookup functions: `findPlayerById`, `findPlayersByName`, `findTeamByAbbreviation`, etc.
- **Tiered HTTP Client**
  - Tier 1: Native fetch with proper headers (default)
  - Tier 2: Puppeteer with stealth plugin for anti-bot bypass
  - Auto mode with automatic fallback
- **TypeScript Support**
  - Full type definitions for all API responses
  - Submodule exports (`/config`, `/utils`, `/types`, `/data/players`, `/data/teams`)
  - Zod schema validation for API responses
- **Response Normalization**
  - Converts NBA's tabular format to typed objects
  - camelCase key conversion from UPPER_SNAKE_CASE
- **Built-in Rate Limiting**
  - Random delays (1-3 seconds) between requests
- **Comprehensive Testing**
  - 161 tests with 75.58% coverage
