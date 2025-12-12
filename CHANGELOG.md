## [1.0.4](https://github.com/aself101/nba-api/compare/v1.0.3...v1.0.4) (2025-12-12)


### Bug Fixes

* **boxscore:** normalize V3 API response field names for box scores ([54b20cd](https://github.com/aself101/nba-api/commit/54b20cd07b47361fab0b7b0f8979130302deb8e6))

## [1.0.3](https://github.com/aself101/nba-api/compare/v1.0.2...v1.0.3) (2025-12-12)


### Bug Fixes

* **endpoints:** use legacy playbyplay endpoint and refactor getShotChartDetail ([800e349](https://github.com/aself101/nba-api/commit/800e34903642810279d1f1e85f24bcbeb1434a8e))

## [1.0.2](https://github.com/aself101/nba-api/compare/v1.0.1...v1.0.2) (2025-12-12)


### Bug Fixes

* **box-score:** use raw API response for V3 box score endpoints ([baa2eb4](https://github.com/aself101/nba-api/commit/baa2eb47cb59bd40f8645e197529121b70c732d9))

## [1.0.1](https://github.com/aself101/nba-api/compare/v1.0.0...v1.0.1) (2025-12-12)


### Bug Fixes

* **scoreboard:** use raw API response for scoreboardv3 endpoint ([71bffd1](https://github.com/aself101/nba-api/commit/71bffd17b0d531436bff4fdcddeb0622d59e2906))

# 1.0.0 (2025-12-12)


### Features

* **nba-api:** comprehensive README and release preparation ([b34ec71](https://github.com/aself101/nba-api/commit/b34ec717c11d757bd58bc4cd156df5d26eb4954b))
* **nba-api:** initial release of NBA Stats API TypeScript wrapper ([0101203](https://github.com/aself101/nba-api/commit/01012033bb9aaf7192cb7b25bdab650f87c70122))

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
