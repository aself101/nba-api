#!/usr/bin/env node

/**
 * NBA API CLI
 *
 * Command-line interface for fetching NBA statistics data.
 *
 * Usage:
 *   nba --league-leaders --season 2024-25
 *   nba --player-career --player-id 2544
 *   nba --live-scoreboard
 *   nba --all --season 2024-25
 */

import { createRequire } from 'module'
import { program } from 'commander'
import { NbaAPI } from './api.js'
import {
  SeasonType,
  getCurrentSeason,
  generateSeasonRange,
  parseSeasonYear,
} from './config.js'
import { writeToFile, randomPause, ProgressReporter } from './utils.js'
import type { CLIOptions, LogLevel, ClientTier } from './types.js'

// Dynamic version import to prevent drift between package.json and CLI
const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const DEFAULT_DATA_DIR = 'datasets'

/**
 * Helper to fetch data and save to file with consistent logging.
 * Reduces repetitive try/catch blocks throughout the CLI.
 */
async function fetchAndSave<T>(
  reporter: ProgressReporter,
  endpointName: string,
  headerName: string,
  fetchFn: () => Promise<T>,
  filepath: string,
  params?: Record<string, unknown>
): Promise<void> {
  reporter.logHeader(headerName)
  try {
    reporter.logFetch(endpointName, params)
    const data = await fetchFn()
    writeToFile(data, filepath)
    reporter.logSuccess(endpointName, filepath)
  } catch (error) {
    reporter.logError(endpointName, (error as Error).message)
  }
}

program
  .name('nba')
  .description('NBA Stats and Live API data fetcher')
  .version(version)

// ============================================================================
// CATEGORY FLAGS
// ============================================================================

program
  .option('--all', 'Fetch all stats endpoints')
  .option('--all-player-endpoints', 'Fetch all player endpoints')
  .option('--all-team-endpoints', 'Fetch all team endpoints')
  .option('--all-league-endpoints', 'Fetch all league endpoints')
  .option('--live', 'Fetch all live endpoints')

// ============================================================================
// PLAYER ENDPOINTS
// ============================================================================

program
  .option('--player-career', 'Fetch player career stats')
  .option('--player-game-log', 'Fetch player game log')
  .option('--player-info', 'Fetch player info')
  .option('--all-players', 'Fetch all players list')
  .option('--player-metrics', 'Fetch player estimated metrics')

// ============================================================================
// TEAM ENDPOINTS
// ============================================================================

program
  .option('--team-roster', 'Fetch team roster')
  .option('--team-game-log', 'Fetch team game log')
  .option('--team-info', 'Fetch team info')
  .option('--team-history', 'Fetch team year-by-year stats')

// ============================================================================
// LEAGUE ENDPOINTS
// ============================================================================

program
  .option('--league-leaders', 'Fetch league leaders')
  .option('--league-dash-players', 'Fetch league dashboard player stats')
  .option('--standings', 'Fetch league standings')
  .option('--game-finder', 'Fetch games using game finder')
  .option('--league-game-log', 'Fetch league game log')

// ============================================================================
// GAME ENDPOINTS
// ============================================================================

program
  .option('--scoreboard', 'Fetch scoreboard for a date')
  .option('--box-score', 'Fetch traditional box score')
  .option('--box-score-advanced', 'Fetch advanced box score')
  .option('--play-by-play', 'Fetch play by play')

// ============================================================================
// OTHER ENDPOINTS
// ============================================================================

program
  .option('--shot-chart', 'Fetch shot chart detail')
  .option('--draft-history', 'Fetch draft history')

// ============================================================================
// LIVE API ENDPOINTS
// ============================================================================

program
  .option('--live-scoreboard', 'Fetch live scoreboard')
  .option('--live-box-score', 'Fetch live box score')
  .option('--live-play-by-play', 'Fetch live play by play')
  .option('--live-odds', 'Fetch live odds')

// ============================================================================
// PARAMETERS
// ============================================================================

program
  .option('--season <season>', 'Single season (format: YYYY-YY)')
  .option('--start-season <season>', 'Start season for range')
  .option('--end-season <season>', 'End season for range')
  .option('--player-id <id>', 'Player ID', parseInt)
  .option('--team-id <id>', 'Team ID', parseInt)
  .option('--game-id <id>', 'Game ID (10 digits)')
  .option('--game-date <date>', 'Game date (YYYY-MM-DD)')
  .option('--season-type <type>', 'Season type (Regular Season, Playoffs)', SeasonType.REGULAR)
  .option('--stat-category <stat>', 'Stat category for league leaders', 'PTS')

// ============================================================================
// OTHER OPTIONS
// ============================================================================

program
  .option('--output-dir <path>', 'Output directory', DEFAULT_DATA_DIR)
  .option('--log-level <level>', 'Log level (DEBUG, INFO, WARNING, ERROR)', 'INFO')
  .option('--client <tier>', 'HTTP client tier (tier1, tier2, auto)', 'tier1')
  .option('--dry-run', 'Preview what would be fetched')
  .option('--examples', 'Show usage examples')

program.parse()

const opts = program.opts() as CLIOptions

// ============================================================================
// SHOW EXAMPLES
// ============================================================================

if (opts.examples) {
  console.log(`
NBA API CLI - Usage Examples
============================

# Fetch league leaders for current season
nba --league-leaders

# Fetch league leaders for specific season
nba --league-leaders --season 2024-25

# Fetch player career stats (LeBron James)
nba --player-career --player-id 2544

# Fetch player game log
nba --player-game-log --player-id 2544 --season 2024-25

# Fetch team roster (Lakers)
nba --team-roster --team-id 1610612747 --season 2024-25

# Fetch standings
nba --standings --season 2024-25

# Fetch scoreboard for today
nba --scoreboard

# Fetch scoreboard for specific date
nba --scoreboard --game-date 2025-01-15

# Fetch box score for a game
nba --box-score --game-id 0022400123

# Fetch live scoreboard
nba --live-scoreboard

# Fetch live box score
nba --live-box-score --game-id 0022400123

# Fetch all player endpoints
nba --all-player-endpoints --player-id 2544 --season 2024-25

# Fetch standings for multiple seasons
nba --standings --start-season 2020-21 --end-season 2024-25

# Dry run to preview
nba --all --season 2024-25 --dry-run

# Use puppeteer client for anti-bot bypass
nba --league-leaders --client tier2

Common Player IDs:
  LeBron James: 2544
  Stephen Curry: 201939
  Kevin Durant: 201142
  Giannis Antetokounmpo: 203507

Common Team IDs:
  Lakers: 1610612747
  Celtics: 1610612738
  Warriors: 1610612744
  Bulls: 1610612741
`)
  process.exit(0)
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
  const reporter = new ProgressReporter({ quiet: opts.dryRun === true })

  // Validate arguments
  if ((opts.startSeason && !opts.endSeason) || (!opts.startSeason && opts.endSeason)) {
    console.error('Error: --start-season and --end-season must be used together')
    process.exit(1)
  }

  // Expand category flags
  if (opts.all) {
    opts.allPlayerEndpoints = true
    opts.allTeamEndpoints = true
    opts.allLeagueEndpoints = true
  }

  if (opts.allPlayerEndpoints) {
    opts.playerCareer = true
    opts.playerGameLog = true
    opts.playerInfo = true
    opts.allPlayers = true
    opts.playerMetrics = true
  }

  if (opts.allTeamEndpoints) {
    opts.teamRoster = true
    opts.teamGameLog = true
    opts.teamInfo = true
    opts.teamHistory = true
  }

  if (opts.allLeagueEndpoints) {
    opts.leagueLeaders = true
    opts.leagueDashPlayers = true
    opts.standings = true
    opts.leagueGameLog = true
  }

  if (opts.live) {
    opts.liveScoreboard = true
    opts.liveOdds = true
  }

  // Check if any endpoint is selected
  const endpoints = [
    opts.playerCareer,
    opts.playerGameLog,
    opts.playerInfo,
    opts.allPlayers,
    opts.playerMetrics,
    opts.teamRoster,
    opts.teamGameLog,
    opts.teamInfo,
    opts.teamHistory,
    opts.leagueLeaders,
    opts.leagueDashPlayers,
    opts.standings,
    opts.gameFinder,
    opts.leagueGameLog,
    opts.scoreboard,
    opts.boxScore,
    opts.boxScoreAdvanced,
    opts.playByPlay,
    opts.shotChart,
    opts.draftHistory,
    opts.liveScoreboard,
    opts.liveBoxScore,
    opts.livePlayByPlay,
    opts.liveOdds,
  ]

  if (!endpoints.some(Boolean)) {
    console.error('Error: At least one endpoint must be specified')
    console.log('Run: nba --examples for usage')
    process.exit(1)
  }

  // Validate required parameters
  const playerEndpoints = [opts.playerCareer, opts.playerGameLog, opts.playerInfo]
  if (playerEndpoints.some(Boolean) && !opts.playerId) {
    console.error('Error: --player-id is required for player endpoints')
    process.exit(1)
  }

  const teamEndpoints = [opts.teamRoster, opts.teamGameLog, opts.teamInfo, opts.teamHistory]
  if (teamEndpoints.some(Boolean) && !opts.teamId) {
    console.error('Error: --team-id is required for team endpoints')
    process.exit(1)
  }

  const gameEndpoints = [opts.boxScore, opts.boxScoreAdvanced, opts.playByPlay, opts.liveBoxScore, opts.livePlayByPlay]
  if (gameEndpoints.some(Boolean) && !opts.gameId) {
    console.error('Error: --game-id is required for box score and play-by-play endpoints')
    process.exit(1)
  }

  if (opts.shotChart && (!opts.playerId || !opts.teamId)) {
    console.error('Error: --player-id and --team-id are required for shot chart')
    process.exit(1)
  }

  // Determine season range
  let seasonRange: string[] = []
  const currentSeason = getCurrentSeason()

  if (opts.season) {
    seasonRange = [opts.season]
  } else if (opts.startSeason && opts.endSeason) {
    const startYear = parseSeasonYear(opts.startSeason)
    const endYear = parseSeasonYear(opts.endSeason)
    seasonRange = generateSeasonRange(startYear, endYear)
  } else {
    seasonRange = [currentSeason]
  }

  // Dry run mode
  if (opts.dryRun) {
    console.log('\n=== DRY RUN ===\n')
    console.log('Would fetch the following:')
    console.log(`  Seasons: ${seasonRange.join(', ')}`)
    if (opts.playerId) console.log(`  Player ID: ${opts.playerId}`)
    if (opts.teamId) console.log(`  Team ID: ${opts.teamId}`)
    if (opts.gameId) console.log(`  Game ID: ${opts.gameId}`)
    if (opts.gameDate) console.log(`  Game Date: ${opts.gameDate}`)
    console.log('\nEndpoints:')
    if (opts.playerCareer) console.log('  - Player Career Stats')
    if (opts.playerGameLog) console.log('  - Player Game Log')
    if (opts.playerInfo) console.log('  - Player Info')
    if (opts.allPlayers) console.log('  - All Players')
    if (opts.playerMetrics) console.log('  - Player Estimated Metrics')
    if (opts.teamRoster) console.log('  - Team Roster')
    if (opts.teamGameLog) console.log('  - Team Game Log')
    if (opts.teamInfo) console.log('  - Team Info')
    if (opts.teamHistory) console.log('  - Team Year-by-Year Stats')
    if (opts.leagueLeaders) console.log('  - League Leaders')
    if (opts.leagueDashPlayers) console.log('  - League Dashboard Player Stats')
    if (opts.standings) console.log('  - League Standings')
    if (opts.gameFinder) console.log('  - Game Finder')
    if (opts.leagueGameLog) console.log('  - League Game Log')
    if (opts.scoreboard) console.log('  - Scoreboard')
    if (opts.boxScore) console.log('  - Box Score Traditional')
    if (opts.boxScoreAdvanced) console.log('  - Box Score Advanced')
    if (opts.playByPlay) console.log('  - Play By Play')
    if (opts.shotChart) console.log('  - Shot Chart')
    if (opts.draftHistory) console.log('  - Draft History')
    if (opts.liveScoreboard) console.log('  - Live Scoreboard')
    if (opts.liveBoxScore) console.log('  - Live Box Score')
    if (opts.livePlayByPlay) console.log('  - Live Play By Play')
    if (opts.liveOdds) console.log('  - Live Odds')
    process.exit(0)
  }

  // Initialize API
  const api = new NbaAPI({
    logLevel: (opts.logLevel as LogLevel) ?? 'INFO',
    clientTier: (opts.client as ClientTier) ?? 'tier1',
  })

  try {
    await api.connect()

    const outputDir = opts.outputDir ?? DEFAULT_DATA_DIR
    const seasonType = opts.seasonType ?? SeasonType.REGULAR

    // ========== LIVE ENDPOINTS (no season iteration) ==========

    if (opts.liveScoreboard) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      await fetchAndSave(
        reporter,
        'liveScoreboard',
        'Live Scoreboard',
        () => api.getLiveScoreboard(),
        `${outputDir}/nba/live/scoreboard/scoreboard_${dateStr}.json`
      )
    }

    if (opts.liveBoxScore && opts.gameId) {
      reporter.logHeader('Live Box Score')
      try {
        reporter.logFetch('liveBoxScore', { gameId: opts.gameId })
        const data = await api.getLiveBoxScore(opts.gameId)
        // Use gameCode for filename: "20241225/SASNYK" -> boxscore_SASNYK_20241225.json
        const [date, teams] = data.gameCode ? data.gameCode.split('/') : ['', '']
        const filename = teams && date ? `boxscore_${teams}_${date}.json` : `boxscore_${opts.gameId}.json`
        const filepath = `${outputDir}/nba/live/boxscore/${filename}`
        writeToFile(data, filepath)
        reporter.logSuccess('liveBoxScore', filepath)
      } catch (error) {
        reporter.logError('liveBoxScore', (error as Error).message)
      }
    }

    if (opts.livePlayByPlay && opts.gameId) {
      reporter.logHeader('Live Play By Play')
      try {
        reporter.logFetch('livePlayByPlay', { gameId: opts.gameId })
        // Fetch live box score first to get gameCode (play by play response doesn't include it)
        const boxScore = await api.getLiveBoxScore(opts.gameId)
        const data = await api.getLivePlayByPlay(opts.gameId)
        // Use gameCode for filename: "20241225/SASNYK" -> playbyplay_SASNYK_20241225.json
        const [date, teams] = boxScore.gameCode ? boxScore.gameCode.split('/') : ['', '']
        const filename = teams && date ? `playbyplay_${teams}_${date}.json` : `playbyplay_${opts.gameId}.json`
        const filepath = `${outputDir}/nba/live/playbyplay/${filename}`
        writeToFile(data, filepath)
        reporter.logSuccess('livePlayByPlay', filepath)
      } catch (error) {
        reporter.logError('livePlayByPlay', (error as Error).message)
      }
    }

    if (opts.liveOdds) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      await fetchAndSave(
        reporter,
        'liveOdds',
        'Live Odds',
        () => api.getLiveOdds(),
        `${outputDir}/nba/live/odds/odds_${dateStr}.json`
      )
    }

    // ========== GAME-SPECIFIC ENDPOINTS (no season iteration) ==========

    if (opts.boxScore && opts.gameId) {
      reporter.logHeader('Box Score Traditional')
      try {
        reporter.logFetch('boxScoreTraditional', { gameId: opts.gameId })
        const data = await api.getBoxScoreTraditional(opts.gameId)
        // Use gameCode for filename: "20241225/SASNYK" -> traditional_SASNYK_20241225.json
        const [date, teams] = data.gameCode ? data.gameCode.split('/') : ['', '']
        const filename = teams && date ? `traditional_${teams}_${date}.json` : `traditional_${opts.gameId}.json`
        const filepath = `${outputDir}/nba/boxscore/${filename}`
        writeToFile(data, filepath)
        reporter.logSuccess('boxScoreTraditional', filepath)
      } catch (error) {
        reporter.logError('boxScoreTraditional', (error as Error).message)
      }
    }

    if (opts.boxScoreAdvanced && opts.gameId) {
      reporter.logHeader('Box Score Advanced')
      try {
        reporter.logFetch('boxScoreAdvanced', { gameId: opts.gameId })
        const data = await api.getBoxScoreAdvanced(opts.gameId)
        // Use gameCode for filename: "20241225/SASNYK" -> advanced_SASNYK_20241225.json
        const [date, teams] = data.gameCode ? data.gameCode.split('/') : ['', '']
        const filename = teams && date ? `advanced_${teams}_${date}.json` : `advanced_${opts.gameId}.json`
        const filepath = `${outputDir}/nba/boxscore/${filename}`
        writeToFile(data, filepath)
        reporter.logSuccess('boxScoreAdvanced', filepath)
      } catch (error) {
        reporter.logError('boxScoreAdvanced', (error as Error).message)
      }
    }

    if (opts.playByPlay && opts.gameId) {
      await fetchAndSave(
        reporter,
        'playByPlay',
        'Play By Play',
        () => api.getPlayByPlay(opts.gameId!),
        `${outputDir}/nba/playbyplay/pbp_${opts.gameId}.json`,
        { gameId: opts.gameId }
      )
    }

    if (opts.scoreboard) {
      const dateStr = opts.gameDate ?? 'today'
      await fetchAndSave(
        reporter,
        'scoreboard',
        'Scoreboard',
        () => api.getScoreboard(opts.gameDate),
        `${outputDir}/nba/scoreboard/scoreboard_${dateStr}.json`,
        { date: opts.gameDate }
      )
    }

    // ========== PLAYER-SPECIFIC ENDPOINTS (no season iteration) ==========

    if (opts.playerCareer && opts.playerId) {
      await fetchAndSave(
        reporter,
        'playerCareerStats',
        'Player Career Stats',
        () => api.getPlayerCareerStats(opts.playerId!),
        `${outputDir}/nba/player/${opts.playerId}/career.json`,
        { playerId: opts.playerId }
      )
    }

    if (opts.playerInfo && opts.playerId) {
      await fetchAndSave(
        reporter,
        'commonPlayerInfo',
        'Player Info',
        () => api.getCommonPlayerInfo(opts.playerId!),
        `${outputDir}/nba/player/${opts.playerId}/info.json`,
        { playerId: opts.playerId }
      )
    }

    if (opts.teamHistory && opts.teamId) {
      await fetchAndSave(
        reporter,
        'teamYearByYearStats',
        'Team Year-by-Year Stats',
        () => api.getTeamYearByYearStats(opts.teamId!),
        `${outputDir}/nba/team/${opts.teamId}/history.json`,
        { teamId: opts.teamId }
      )
    }

    if (opts.draftHistory) {
      reporter.logHeader('Draft History')
      for (const season of seasonRange) {
        const year = parseSeasonYear(season)
        try {
          reporter.logFetch('draftHistory', { year })
          const data = await api.getDraftHistory(year)
          const filepath = `${outputDir}/nba/draft/draft_${year}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('draftHistory', filepath)
          if (seasonRange.length > 1) await randomPause()
        } catch (error) {
          reporter.logError(`draftHistory (${year})`, (error as Error).message)
        }
      }
    }

    // ========== SEASON-BASED ENDPOINTS ==========

    for (const season of seasonRange) {
      reporter.logHeader(`Season: ${season}`)

      // Player endpoints
      if (opts.playerGameLog && opts.playerId) {
        try {
          reporter.logFetch('playerGameLog', { playerId: opts.playerId, season })
          const data = await api.getPlayerGameLog(opts.playerId, season, seasonType)
          const filepath = `${outputDir}/nba/player/${opts.playerId}/gamelog_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('playerGameLog', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`playerGameLog (${season})`, (error as Error).message)
        }
      }

      if (opts.allPlayers) {
        try {
          reporter.logFetch('commonAllPlayers', { season })
          const data = await api.getCommonAllPlayers(season)
          const filepath = `${outputDir}/nba/players/all_players_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('commonAllPlayers', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`commonAllPlayers (${season})`, (error as Error).message)
        }
      }

      if (opts.playerMetrics) {
        try {
          reporter.logFetch('playerEstimatedMetrics', { season })
          const data = await api.getPlayerEstimatedMetrics(season)
          const filepath = `${outputDir}/nba/players/metrics_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('playerEstimatedMetrics', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`playerEstimatedMetrics (${season})`, (error as Error).message)
        }
      }

      // Team endpoints
      if (opts.teamRoster && opts.teamId) {
        try {
          reporter.logFetch('commonTeamRoster', { teamId: opts.teamId, season })
          const data = await api.getCommonTeamRoster(opts.teamId, season)
          const filepath = `${outputDir}/nba/team/${opts.teamId}/roster_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('commonTeamRoster', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`commonTeamRoster (${season})`, (error as Error).message)
        }
      }

      if (opts.teamGameLog && opts.teamId) {
        try {
          reporter.logFetch('teamGameLog', { teamId: opts.teamId, season })
          const data = await api.getTeamGameLog(opts.teamId, season, seasonType)
          const filepath = `${outputDir}/nba/team/${opts.teamId}/gamelog_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('teamGameLog', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`teamGameLog (${season})`, (error as Error).message)
        }
      }

      if (opts.teamInfo && opts.teamId) {
        try {
          reporter.logFetch('teamInfoCommon', { teamId: opts.teamId, season })
          const data = await api.getTeamInfoCommon(opts.teamId, season)
          const filepath = `${outputDir}/nba/team/${opts.teamId}/info_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('teamInfoCommon', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`teamInfoCommon (${season})`, (error as Error).message)
        }
      }

      // League endpoints
      if (opts.leagueLeaders) {
        try {
          const statCat = opts.statCategory ?? 'PTS'
          reporter.logFetch('leagueLeaders', { season, statCategory: statCat })
          const data = await api.getLeagueLeaders(season, statCat)
          const filepath = `${outputDir}/nba/league/leaders_${statCat}_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('leagueLeaders', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`leagueLeaders (${season})`, (error as Error).message)
        }
      }

      if (opts.leagueDashPlayers) {
        try {
          reporter.logFetch('leagueDashPlayerStats', { season })
          const data = await api.getLeagueDashPlayerStats({ season, seasonType })
          const filepath = `${outputDir}/nba/league/dash_players_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('leagueDashPlayerStats', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`leagueDashPlayerStats (${season})`, (error as Error).message)
        }
      }

      if (opts.standings) {
        try {
          reporter.logFetch('leagueStandings', { season })
          const data = await api.getLeagueStandings(season, seasonType)
          const filepath = `${outputDir}/nba/league/standings_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('leagueStandings', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`leagueStandings (${season})`, (error as Error).message)
        }
      }

      if (opts.leagueGameLog) {
        try {
          reporter.logFetch('leagueGameLog', { season })
          const data = await api.getLeagueGameLog(season, seasonType)
          const filepath = `${outputDir}/nba/league/gamelog_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('leagueGameLog', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`leagueGameLog (${season})`, (error as Error).message)
        }
      }

      if (opts.shotChart && opts.playerId) {
        try {
          reporter.logFetch('shotChartDetail', { playerId: opts.playerId, teamId: opts.teamId, season })
          const data = await api.getShotChartDetail({
            playerId: opts.playerId,
            ...(opts.teamId && { teamId: opts.teamId }),
            season,
          })
          const filepath = `${outputDir}/nba/shotchart/player_${opts.playerId}_${season}.json`
          writeToFile(data, filepath)
          reporter.logSuccess('shotChartDetail', filepath)
          await randomPause()
        } catch (error) {
          reporter.logError(`shotChartDetail (${season})`, (error as Error).message)
        }
      }
    }

    reporter.logInfo('\nDone!')
  } finally {
    await api.close()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
