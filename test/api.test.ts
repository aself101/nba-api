/**
 * NbaAPI Class Tests
 *
 * Tests the main API class with mocked HTTP responses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NbaAPI } from '../src/api.js'

// Mock the utils module to intercept HTTP calls
vi.mock('../src/utils.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/utils.js')>()
  return {
    ...actual,
    fetchStats: vi.fn(),
    fetchLive: vi.fn(),
    createPuppeteerClient: vi.fn(),
  }
})

import { fetchStats, fetchLive } from '../src/utils.js'

const mockFetchStats = vi.mocked(fetchStats)
const mockFetchLive = vi.mocked(fetchLive)

describe('NbaAPI', () => {
  let api: NbaAPI

  beforeEach(() => {
    api = new NbaAPI({ logLevel: 'NONE' })
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await api.close()
  })

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const defaultApi = new NbaAPI()
      expect(defaultApi).toBeInstanceOf(NbaAPI)
      expect(defaultApi.connected).toBe(false)
    })

    it('should accept custom options', () => {
      const customApi = new NbaAPI({
        logLevel: 'DEBUG',
        timeout: 60000,
        clientTier: 'tier2',
      })
      expect(customApi).toBeInstanceOf(NbaAPI)
    })
  })

  describe('connect/close', () => {
    it('should connect and set connected state', async () => {
      expect(api.connected).toBe(false)
      await api.connect()
      expect(api.connected).toBe(true)
    })

    it('should close and reset connected state', async () => {
      await api.connect()
      expect(api.connected).toBe(true)
      await api.close()
      expect(api.connected).toBe(false)
    })

    it('should handle multiple connect calls gracefully', async () => {
      await api.connect()
      await api.connect() // Should not throw
      expect(api.connected).toBe(true)
    })
  })

  describe('getPlayerCareerStats', () => {
    it('should fetch player career stats', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/playercareerstats?PlayerID=2544',
        statusCode: 200,
        data: {
          SeasonTotalsRegularSeason: [
            {
              PLAYER_ID: 2544,
              SEASON_ID: '2024-25',
              TEAM_ABBREVIATION: 'LAL',
              GP: 50,
              PTS: 1250,
            },
          ],
        },
        raw: {},
      })

      const stats = await api.getPlayerCareerStats(2544)

      expect(mockFetchStats).toHaveBeenCalledWith(
        'playercareerstats',
        expect.objectContaining({
          PlayerID: 2544,
          PerMode: 'Totals',
          LeagueID: '00',
        }),
        expect.any(Object)
      )
      expect(stats).toHaveLength(1)
      expect(stats[0]).toHaveProperty('playerId', 2544)
      expect(stats[0]).toHaveProperty('seasonId', '2024-25')
    })

    it('should accept perMode option', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/playercareerstats',
        statusCode: 200,
        data: { SeasonTotalsRegularSeason: [] },
        raw: {},
      })

      await api.getPlayerCareerStats(2544, { perMode: 'PerGame' })

      expect(mockFetchStats).toHaveBeenCalledWith(
        'playercareerstats',
        expect.objectContaining({
          PerMode: 'PerGame',
        }),
        expect.any(Object)
      )
    })

    it('should throw on invalid player ID', async () => {
      await expect(api.getPlayerCareerStats(-1)).rejects.toThrow(
        'Invalid player ID'
      )
      await expect(api.getPlayerCareerStats(0)).rejects.toThrow(
        'Invalid player ID'
      )
    })

    it('should return empty array when no data', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/playercareerstats',
        statusCode: 200,
        data: {},
        raw: {},
      })

      const stats = await api.getPlayerCareerStats(999999)
      expect(stats).toEqual([])
    })
  })

  describe('getPlayerGameLog', () => {
    it('should fetch player game log', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/playergamelog',
        statusCode: 200,
        data: {
          PlayerGameLog: [
            {
              GAME_ID: '0022400123',
              GAME_DATE: 'JAN 15, 2025',
              MATCHUP: 'LAL vs. GSW',
              PTS: 30,
              REB: 8,
              AST: 10,
            },
          ],
        },
        raw: {},
      })

      const gameLog = await api.getPlayerGameLog(2544, '2024-25')

      expect(mockFetchStats).toHaveBeenCalledWith(
        'playergamelog',
        expect.objectContaining({
          PlayerID: 2544,
          Season: '2024-25',
          SeasonType: 'Regular Season',
        }),
        expect.any(Object)
      )
      expect(gameLog).toHaveLength(1)
      expect(gameLog[0]).toHaveProperty('pts', 30)
    })

    it('should use current season when not specified', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/playergamelog',
        statusCode: 200,
        data: { PlayerGameLog: [] },
        raw: {},
      })

      await api.getPlayerGameLog(2544)

      expect(mockFetchStats).toHaveBeenCalledWith(
        'playergamelog',
        expect.objectContaining({
          Season: expect.stringMatching(/^\d{4}-\d{2}$/),
        }),
        expect.any(Object)
      )
    })
  })

  describe('getCommonPlayerInfo', () => {
    it('should fetch player info', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/commonplayerinfo',
        statusCode: 200,
        data: {
          CommonPlayerInfo: [
            {
              PERSON_ID: 2544,
              DISPLAY_FIRST_LAST: 'LeBron James',
              TEAM_NAME: 'Lakers',
              JERSEY: '23',
              POSITION: 'Forward',
              HEIGHT: '6-9',
              WEIGHT: '250',
            },
          ],
        },
        raw: {},
      })

      const info = await api.getCommonPlayerInfo(2544)

      expect(info).toHaveProperty('personId', 2544)
      expect(info).toHaveProperty('displayFirstLast', 'LeBron James')
    })

    it('should throw when player not found', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/commonplayerinfo',
        statusCode: 200,
        data: { CommonPlayerInfo: [] },
        raw: {},
      })

      await expect(api.getCommonPlayerInfo(999999)).rejects.toThrow(
        'Player not found: 999999'
      )
    })
  })

  describe('getLeagueLeaders', () => {
    it('should fetch league leaders', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leagueleaders',
        statusCode: 200,
        data: {
          LeagueLeaders: [
            {
              RANK: 1,
              PLAYER: 'Luka Doncic',
              TEAM: 'DAL',
              PTS: 33.9,
            },
            {
              RANK: 2,
              PLAYER: 'Shai Gilgeous-Alexander',
              TEAM: 'OKC',
              PTS: 31.2,
            },
          ],
        },
        raw: {},
      })

      const leaders = await api.getLeagueLeaders('2024-25', 'PTS')

      expect(mockFetchStats).toHaveBeenCalledWith(
        'leagueleaders',
        expect.objectContaining({
          Season: '2024-25',
          StatCategory: 'PTS',
        }),
        expect.any(Object)
      )
      expect(leaders).toHaveLength(2)
      expect(leaders[0]).toHaveProperty('rank', 1)
      expect(leaders[0]).toHaveProperty('player', 'Luka Doncic')
    })
  })

  describe('getCommonTeamRoster', () => {
    it('should fetch team roster', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/commonteamroster',
        statusCode: 200,
        data: {
          CommonTeamRoster: [
            {
              PLAYER_ID: 2544,
              PLAYER: 'LeBron James',
              NUM: '23',
              POSITION: 'F',
              AGE: 40,
            },
          ],
        },
        raw: {},
      })

      const roster = await api.getCommonTeamRoster(1610612747, '2024-25')

      expect(mockFetchStats).toHaveBeenCalledWith(
        'commonteamroster',
        expect.objectContaining({
          TeamID: 1610612747,
          Season: '2024-25',
        }),
        expect.any(Object)
      )
      expect(roster).toHaveLength(1)
      expect(roster[0]).toHaveProperty('player', 'LeBron James')
    })

    it('should throw on invalid team ID', async () => {
      await expect(api.getCommonTeamRoster(-1)).rejects.toThrow(
        'Invalid team ID'
      )
    })
  })

  describe('getLeagueStandings', () => {
    it('should fetch league standings', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguestandingsv3',
        statusCode: 200,
        data: {
          Standings: [
            {
              TEAM_ID: 1610612738,
              TEAM_NAME: 'Celtics',
              CONFERENCE: 'East',
              WINS: 40,
              LOSSES: 10,
              WIN_PCT: 0.8,
            },
          ],
        },
        raw: {},
      })

      const standings = await api.getLeagueStandings('2024-25')

      expect(standings).toHaveLength(1)
      expect(standings[0]).toHaveProperty('teamName', 'Celtics')
      expect(standings[0]).toHaveProperty('wins', 40)
    })
  })

  describe('getTeamGameLog', () => {
    it('should fetch team game log', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/teamgamelog',
        statusCode: 200,
        data: {
          TeamGameLog: [
            {
              GAME_ID: '0022400123',
              GAME_DATE: 'JAN 15, 2025',
              MATCHUP: 'LAL vs. GSW',
              WL: 'W',
              PTS: 115,
            },
          ],
        },
        raw: {},
      })

      const log = await api.getTeamGameLog(1610612747, '2024-25')

      expect(log).toHaveLength(1)
      expect(log[0]).toHaveProperty('wl', 'W')
    })
  })

  describe('getTeamInfoCommon', () => {
    it('should fetch team info', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/teaminfocommon',
        statusCode: 200,
        data: {
          TeamInfoCommon: [
            {
              TEAM_ID: 1610612747,
              TEAM_NAME: 'Lakers',
              TEAM_CITY: 'Los Angeles',
              TEAM_CONFERENCE: 'West',
            },
          ],
        },
        raw: {},
      })

      const info = await api.getTeamInfoCommon(1610612747)

      expect(info).toHaveProperty('teamName', 'Lakers')
    })

    it('should throw when team not found', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/teaminfocommon',
        statusCode: 200,
        data: { TeamInfoCommon: [] },
        raw: {},
      })

      await expect(api.getTeamInfoCommon(999999)).rejects.toThrow(
        'Team not found: 999999'
      )
    })
  })

  describe('getTeamYearByYearStats', () => {
    it('should fetch team year by year stats', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/teamyearbyyearstats',
        statusCode: 200,
        data: {
          TeamStats: [
            {
              YEAR: '2024-25',
              WINS: 50,
              LOSSES: 32,
            },
          ],
        },
        raw: {},
      })

      const stats = await api.getTeamYearByYearStats(1610612747)

      expect(stats).toHaveLength(1)
      expect(stats[0]).toHaveProperty('wins', 50)
    })
  })

  describe('getScoreboard', () => {
    it('should fetch scoreboard for a date', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/scoreboardv3',
        statusCode: 200,
        data: {
          scoreboard: {
            gameDate: '2025-01-15',
            games: [],
          },
        },
        raw: {},
      })

      const scoreboard = await api.getScoreboard('2025-01-15')

      expect(scoreboard).toHaveProperty('gameDate', '2025-01-15')
      expect(scoreboard).toHaveProperty('leagueId', '00')
      expect(scoreboard.games).toEqual([])
    })
  })

  describe('getLeagueDashPlayerStats', () => {
    it('should fetch league dashboard player stats', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguedashplayerstats',
        statusCode: 200,
        data: {
          LeagueDashPlayerStats: [
            {
              PLAYER_ID: 2544,
              PLAYER_NAME: 'LeBron James',
              TEAM_ID: 1610612747,
              GP: 50,
              PTS: 1350,
              REB: 400,
              AST: 450,
            },
          ],
        },
        raw: {},
      })

      const stats = await api.getLeagueDashPlayerStats()

      expect(mockFetchStats).toHaveBeenCalledWith(
        'leaguedashplayerstats',
        expect.objectContaining({
          PerMode: 'Totals',
          MeasureType: 'Base',
          SeasonType: 'Regular Season',
        }),
        expect.any(Object)
      )
      expect(stats).toHaveLength(1)
      expect(stats[0]).toHaveProperty('playerId', 2544)
      expect(stats[0]).toHaveProperty('playerName', 'LeBron James')
    })

    it('should accept filter options', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguedashplayerstats',
        statusCode: 200,
        data: { LeagueDashPlayerStats: [] },
        raw: {},
      })

      await api.getLeagueDashPlayerStats({
        perMode: 'PerGame',
        conference: 'West',
        season: '2024-25',
      })

      expect(mockFetchStats).toHaveBeenCalledWith(
        'leaguedashplayerstats',
        expect.objectContaining({
          PerMode: 'PerGame',
          Conference: 'West',
          Season: '2024-25',
        }),
        expect.any(Object)
      )
    })

    it('should return empty array when no data', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguedashplayerstats',
        statusCode: 200,
        data: {},
        raw: {},
      })

      const stats = await api.getLeagueDashPlayerStats()
      expect(stats).toEqual([])
    })
  })

  describe('getLeagueGameFinder', () => {
    it('should search for games with default options', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguegamefinder',
        statusCode: 200,
        data: {
          LeagueGameFinderResults: [
            {
              GAME_ID: '0022400123',
              GAME_DATE: '2025-01-15',
              TEAM_NAME: 'Lakers',
              MATCHUP: 'LAL vs. GSW',
              WL: 'W',
              PTS: 115,
            },
          ],
        },
        raw: {},
      })

      const results = await api.getLeagueGameFinder()

      expect(mockFetchStats).toHaveBeenCalledWith(
        'leaguegamefinder',
        expect.objectContaining({
          PlayerOrTeam: 'T',
          SeasonType: 'Regular Season',
        }),
        expect.any(Object)
      )
      expect(results).toHaveLength(1)
      expect(results[0]).toHaveProperty('gameId', '0022400123')
      expect(results[0]).toHaveProperty('wl', 'W')
    })

    it('should accept date range and team filters', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguegamefinder',
        statusCode: 200,
        data: { LeagueGameFinderResults: [] },
        raw: {},
      })

      await api.getLeagueGameFinder({
        teamId: 1610612747,
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        outcome: 'W',
      })

      expect(mockFetchStats).toHaveBeenCalledWith(
        'leaguegamefinder',
        expect.objectContaining({
          TeamID: 1610612747,
          DateFrom: '2025-01-01',
          DateTo: '2025-01-31',
          Outcome: 'W',
        }),
        expect.any(Object)
      )
    })

    it('should throw on invalid date format', async () => {
      await expect(
        api.getLeagueGameFinder({ dateFrom: 'invalid-date' })
      ).rejects.toThrow('Invalid date format')
    })

    it('should return empty array when no matches', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguegamefinder',
        statusCode: 200,
        data: {},
        raw: {},
      })

      const results = await api.getLeagueGameFinder()
      expect(results).toEqual([])
    })
  })

  describe('getLeagueGameLog', () => {
    it('should fetch league game log', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguegamelog',
        statusCode: 200,
        data: {
          LeagueGameLog: [
            {
              GAME_ID: '0022400123',
              GAME_DATE: 'JAN 15, 2025',
              TEAM_NAME: 'Lakers',
              MATCHUP: 'LAL vs. GSW',
              WL: 'W',
              PTS: 115,
            },
            {
              GAME_ID: '0022400124',
              GAME_DATE: 'JAN 15, 2025',
              TEAM_NAME: 'Warriors',
              MATCHUP: 'GSW @ LAL',
              WL: 'L',
              PTS: 108,
            },
          ],
        },
        raw: {},
      })

      const log = await api.getLeagueGameLog('2024-25')

      expect(mockFetchStats).toHaveBeenCalledWith(
        'leaguegamelog',
        expect.objectContaining({
          Season: '2024-25',
          SeasonType: 'Regular Season',
          PlayerOrTeam: 'T',
        }),
        expect.any(Object)
      )
      expect(log).toHaveLength(2)
      expect(log[0]).toHaveProperty('gameId', '0022400123')
      expect(log[0]).toHaveProperty('teamName', 'Lakers')
    })

    it('should use current season when not specified', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguegamelog',
        statusCode: 200,
        data: { LeagueGameLog: [] },
        raw: {},
      })

      await api.getLeagueGameLog()

      expect(mockFetchStats).toHaveBeenCalledWith(
        'leaguegamelog',
        expect.objectContaining({
          Season: expect.stringMatching(/^\d{4}-\d{2}$/),
        }),
        expect.any(Object)
      )
    })

    it('should return empty array when no games', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/leaguegamelog',
        statusCode: 200,
        data: {},
        raw: {},
      })

      const log = await api.getLeagueGameLog()
      expect(log).toEqual([])
    })
  })

  describe('getShotChartDetail', () => {
    it('should fetch shot chart data for a player', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/shotchartdetail',
        statusCode: 200,
        data: {
          Shot_Chart_Detail: [
            {
              PLAYER_ID: 2544,
              GAME_ID: '0022400123',
              LOC_X: 15,
              LOC_Y: 80,
              SHOT_MADE_FLAG: 1,
              SHOT_TYPE: '3PT Field Goal',
            },
            {
              PLAYER_ID: 2544,
              GAME_ID: '0022400123',
              LOC_X: -50,
              LOC_Y: 40,
              SHOT_MADE_FLAG: 0,
              SHOT_TYPE: '2PT Field Goal',
            },
          ],
        },
        raw: {},
      })

      const shots = await api.getShotChartDetail({ playerId: 2544 })

      expect(mockFetchStats).toHaveBeenCalledWith(
        'shotchartdetail',
        expect.objectContaining({
          PlayerID: 2544,
          ContextMeasure: 'FGA',
        }),
        expect.any(Object)
      )
      expect(shots).toHaveLength(2)
      expect(shots[0]).toHaveProperty('playerId', 2544)
      expect(shots[0]).toHaveProperty('locX', 15)
      expect(shots[0]).toHaveProperty('shotMadeFlag', 1)
    })

    it('should accept season and team filters', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/shotchartdetail',
        statusCode: 200,
        data: { Shot_Chart_Detail: [] },
        raw: {},
      })

      await api.getShotChartDetail({
        playerId: 2544,
        teamId: 1610612747,
        season: '2024-25',
        gameId: '0022400123',
      })

      expect(mockFetchStats).toHaveBeenCalledWith(
        'shotchartdetail',
        expect.objectContaining({
          PlayerID: 2544,
          TeamID: 1610612747,
          Season: '2024-25',
          GameID: '0022400123',
        }),
        expect.any(Object)
      )
    })

    it('should throw on invalid player ID', async () => {
      await expect(api.getShotChartDetail({ playerId: -1 })).rejects.toThrow(
        'Invalid player ID'
      )
    })

    it('should return empty array when no shots', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/shotchartdetail',
        statusCode: 200,
        data: {},
        raw: {},
      })

      const shots = await api.getShotChartDetail({ playerId: 2544 })
      expect(shots).toEqual([])
    })
  })

  describe('getBoxScoreAdvanced', () => {
    it('should fetch advanced box score', async () => {
      // Mock _getGameInfo call (first fetchLive)
      mockFetchLive.mockResolvedValueOnce({
        url: 'https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022400123.json',
        statusCode: 200,
        data: {
          game: {
            gameId: '0022400123',
            gameCode: '20250115/LALGSW',
          },
        },
        raw: {},
      })

      // Mock box score advanced API call (fetchStats with returnRaw)
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/boxscoreadvancedv3',
        statusCode: 200,
        data: {},
        raw: {
          boxScoreAdvanced: {
            gameId: '0022400123',
            homeTeamId: 1610612747,
            awayTeamId: 1610612744,
            homeTeam: {
              teamId: 1610612747,
              teamCity: 'Los Angeles',
              teamName: 'Lakers',
              teamTricode: 'LAL',
              players: [
                {
                  personId: 2544,
                  firstName: 'LeBron',
                  familyName: 'James',
                  statistics: {
                    offensiveRating: 118.5,
                    defensiveRating: 105.2,
                    netRating: 13.3,
                    pace: 98.5,
                    pie: 0.185,
                  },
                },
              ],
              statistics: {
                offensiveRating: 115.0,
                defensiveRating: 108.0,
                pace: 98.5,
              },
            },
            awayTeam: {
              teamId: 1610612744,
              teamCity: 'Golden State',
              teamName: 'Warriors',
              teamTricode: 'GSW',
              players: [],
              statistics: {
                offensiveRating: 108.0,
                defensiveRating: 115.0,
                pace: 98.5,
              },
            },
          },
        },
      })

      const boxScore = await api.getBoxScoreAdvanced('0022400123')

      expect(mockFetchStats).toHaveBeenCalledWith(
        'boxscoreadvancedv3',
        expect.objectContaining({ GameID: '0022400123' }),
        expect.any(Object)
      )
      expect(boxScore.gameId).toBe('0022400123')
      expect(boxScore.homeTeamId).toBe(1610612747)
      expect(boxScore.gameCode).toBe('20250115/LALGSW')
      expect(boxScore.gameDateEst).toBe('20250115')
      expect(boxScore.playerStats).toHaveLength(1)
      expect(boxScore.playerStats[0].playerId).toBe(2544)
      expect(boxScore.playerStats[0].playerName).toBe('LeBron James')
      expect(boxScore.teamStats).toHaveLength(2)
      expect(boxScore.teamStats[0].teamName).toBe('Lakers')
    })

    it('should throw on invalid game ID', async () => {
      await expect(api.getBoxScoreAdvanced('123')).rejects.toThrow(
        'Invalid game ID'
      )
    })
  })

  describe('getCommonAllPlayers', () => {
    it('should fetch all players list', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/commonallplayers',
        statusCode: 200,
        data: {
          CommonAllPlayers: [
            {
              PERSON_ID: 2544,
              DISPLAY_FIRST_LAST: 'LeBron James',
              ROSTERSTATUS: 1,
            },
          ],
        },
        raw: {},
      })

      const players = await api.getCommonAllPlayers('2024-25')

      expect(players).toHaveLength(1)
      expect(players[0]).toHaveProperty('personId', 2544)
    })
  })

  describe('getPlayerEstimatedMetrics', () => {
    it('should fetch player metrics', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/playerestimatedmetrics',
        statusCode: 200,
        data: {
          PlayerEstimatedMetrics: [
            {
              PLAYER_ID: 2544,
              E_OFF_RATING: 115.5,
              E_DEF_RATING: 108.2,
            },
          ],
        },
        raw: {},
      })

      const metrics = await api.getPlayerEstimatedMetrics('2024-25')

      expect(metrics).toHaveLength(1)
      expect(metrics[0]).toHaveProperty('playerId', 2544)
    })
  })

  describe('getDraftHistory', () => {
    it('should fetch draft history', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/drafthistory',
        statusCode: 200,
        data: {
          DraftHistory: [
            {
              PLAYER_NAME: 'Zach Edey',
              TEAM_NAME: 'Grizzlies',
              OVERALL_PICK: 9,
              SEASON: 2024,
            },
          ],
        },
        raw: {},
      })

      const draft = await api.getDraftHistory(2024)

      expect(draft).toHaveLength(1)
      expect(draft[0]).toHaveProperty('playerName', 'Zach Edey')
    })
  })

  describe('getLivePlayByPlay', () => {
    it('should fetch live play by play', async () => {
      mockFetchLive.mockResolvedValueOnce({
        url: 'https://cdn.nba.com/static/json/liveData/playbyplay/playbyplay_0022400123.json',
        statusCode: 200,
        data: {
          game: {
            gameId: '0022400123',
            actions: [],
          },
        },
        raw: {},
      })

      const pbp = await api.getLivePlayByPlay('0022400123')

      expect(pbp).toHaveProperty('gameId', '0022400123')
    })
  })

  describe('getLiveOdds', () => {
    it('should fetch live odds', async () => {
      mockFetchLive.mockResolvedValueOnce({
        url: 'https://cdn.nba.com/static/json/liveData/odds/odds_todaysGames.json',
        statusCode: 200,
        data: {
          games: [
            {
              gameId: '0022400123',
              homeTeam: { spread: -5.5, moneyLine: -200 },
              awayTeam: { spread: 5.5, moneyLine: 170 },
            },
          ],
        },
        raw: {},
      })

      const odds = await api.getLiveOdds()

      expect(mockFetchLive).toHaveBeenCalledWith(
        'odds/odds_todaysGames.json',
        expect.any(Object)
      )
      expect(odds).toHaveProperty('games')
      expect(Array.isArray(odds.games)).toBe(true)
    })

    it('should return empty structure when no odds available', async () => {
      mockFetchLive.mockResolvedValueOnce({
        url: 'https://cdn.nba.com/static/json/liveData/odds/odds_todaysGames.json',
        statusCode: 200,
        data: {},
        raw: {},
      })

      const odds = await api.getLiveOdds()
      expect(odds).toEqual({})
    })
  })

  describe('getLiveScoreboard', () => {
    it('should fetch live scoreboard', async () => {
      mockFetchLive.mockResolvedValueOnce({
        url: 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
        statusCode: 200,
        data: {
          scoreboard: {
            gameDate: '2025-01-15',
            games: [
              {
                gameId: '0022400123',
                homeTeam: { teamName: 'Lakers', score: 105 },
                awayTeam: { teamName: 'Warriors', score: 98 },
              },
            ],
          },
        },
        raw: {},
      })

      const scoreboard = await api.getLiveScoreboard()

      expect(mockFetchLive).toHaveBeenCalledWith(
        'scoreboard/todaysScoreboard_00.json',
        expect.any(Object)
      )
      // API extracts scoreboard from response
      expect(scoreboard).toHaveProperty('gameDate', '2025-01-15')
      expect(scoreboard.games).toHaveLength(1)
    })
  })

  describe('getLiveBoxScore', () => {
    it('should fetch live box score', async () => {
      mockFetchLive.mockResolvedValueOnce({
        url: 'https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022400123.json',
        statusCode: 200,
        data: {
          game: {
            gameId: '0022400123',
            homeTeam: { teamName: 'Lakers' },
            awayTeam: { teamName: 'Warriors' },
          },
        },
        raw: {},
      })

      const boxScore = await api.getLiveBoxScore('0022400123')

      expect(mockFetchLive).toHaveBeenCalledWith(
        'boxscore/boxscore_{game_id}.json',
        expect.objectContaining({ gameId: '0022400123' })
      )
      // API extracts game from response
      expect(boxScore).toHaveProperty('gameId', '0022400123')
      expect(boxScore).toHaveProperty('homeTeam')
    })

    it('should throw on invalid game ID', async () => {
      await expect(api.getLiveBoxScore('123')).rejects.toThrow(
        'Invalid game ID'
      )
      await expect(api.getLiveBoxScore('abc1234567')).rejects.toThrow(
        'Invalid game ID'
      )
    })
  })

  describe('getBoxScoreTraditional', () => {
    it('should fetch traditional box score', async () => {
      // V3 box score uses raw response with specific field names
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/boxscoretraditionalv3',
        statusCode: 200,
        data: {},
        raw: {
          boxScoreTraditional: {
            gameId: '0022400123',
            homeTeamId: 1610612747,
            awayTeamId: 1610612738,
            homeTeam: {
              teamId: 1610612747,
              teamCity: 'Los Angeles',
              teamName: 'Lakers',
              teamTricode: 'LAL',
              players: [
                {
                  personId: 2544,
                  firstName: 'LeBron',
                  familyName: 'James',
                  nameI: 'L. James',
                  statistics: { points: 30, rebounds: 10, assists: 8 },
                },
              ],
              statistics: { points: 110, rebounds: 45 },
            },
            awayTeam: {
              teamId: 1610612738,
              teamCity: 'Boston',
              teamName: 'Celtics',
              teamTricode: 'BOS',
              players: [],
              statistics: { points: 105, rebounds: 40 },
            },
          },
        },
      })

      const boxScore = await api.getBoxScoreTraditional('0022400123')

      expect(mockFetchStats).toHaveBeenCalledWith(
        'boxscoretraditionalv3',
        expect.objectContaining({ GameID: '0022400123' }),
        expect.any(Object)
      )
      expect(boxScore).toBeDefined()
      expect(boxScore.gameId).toBe('0022400123')
      expect(boxScore.playerStats).toHaveLength(1)
      expect(boxScore.playerStats[0].playerId).toBe(2544)
      expect(boxScore.playerStats[0].playerName).toBe('LeBron James')
      expect(boxScore.teamStats).toHaveLength(2)
      expect(boxScore.teamStats[0].teamName).toBe('Lakers')
    })
  })

  describe('getPlayByPlay', () => {
    it('should fetch play by play', async () => {
      mockFetchStats.mockResolvedValueOnce({
        url: 'https://stats.nba.com/stats/playbyplayv3',
        statusCode: 200,
        data: {
          PlayByPlay: [
            {
              ACTION_NUMBER: 1,
              ACTION_TYPE: 'jumpball',
              DESCRIPTION: 'Jump Ball',
            },
            {
              ACTION_NUMBER: 2,
              ACTION_TYPE: 'shot',
              DESCRIPTION: 'LeBron James makes 3-pointer',
            },
          ],
        },
        raw: {},
      })

      const plays = await api.getPlayByPlay('0022400123')

      expect(plays).toHaveLength(2)
      // Keys are normalized to camelCase
      expect(plays[0]).toHaveProperty('actionNumber', 1)
    })
  })

  describe('error handling', () => {
    it('should propagate HTTP errors', async () => {
      mockFetchStats.mockRejectedValueOnce(new Error('HTTP 403: Forbidden'))

      await expect(api.getLeagueLeaders()).rejects.toThrow('HTTP 403')
    })

    it('should propagate network errors', async () => {
      mockFetchStats.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.getPlayerCareerStats(2544)).rejects.toThrow(
        'Network error'
      )
    })
  })

  describe('static data access', () => {
    it('should provide getPlayers method', () => {
      const players = api.getPlayers()
      expect(Array.isArray(players)).toBe(true)
      expect(players.length).toBeGreaterThan(5000)
    })

    it('should provide getTeams method', () => {
      const teams = api.getTeams()
      expect(Array.isArray(teams)).toBe(true)
      expect(teams).toHaveLength(30)
    })

    it('should provide findPlayersByName method', () => {
      const lebrons = api.findPlayersByName('LeBron')
      expect(lebrons.length).toBeGreaterThanOrEqual(1)
      expect(lebrons.some((p) => p.fullName === 'LeBron James')).toBe(true)
    })

    it('should provide findTeamsByName method', () => {
      const lakers = api.findTeamsByName('Lakers')
      expect(lakers.length).toBeGreaterThanOrEqual(1)
      expect(lakers[0]?.abbreviation).toBe('LAL')
    })

    it('should provide findPlayerById method', () => {
      const lebron = api.findPlayerById(2544)
      expect(lebron).not.toBeNull()
      expect(lebron?.fullName).toBe('LeBron James')
    })

    it('should provide findTeamByAbbreviation method', () => {
      const lakers = api.findTeamByAbbreviation('LAL')
      expect(lakers).not.toBeNull()
      expect(lakers?.fullName).toBe('Los Angeles Lakers')
    })
  })
})
