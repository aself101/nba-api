/**
 * Config Module Tests
 */

import { describe, it, expect } from 'vitest'
import {
  STATS_BASE_URL,
  LIVE_BASE_URL,
  ENDPOINTS,
  SeasonType,
  PerMode,
  LeagueID,
  getCurrentSeason,
  formatSeason,
  parseSeasonYear,
  validateSeason,
  generateSeasonRange,
  validatePlayerId,
  validateTeamId,
  validateGameId,
  validateDate,
  buildStatsUrl,
  buildLiveUrl,
} from '../src/config.js'

describe('Config Constants', () => {
  it('should have correct base URLs', () => {
    expect(STATS_BASE_URL).toBe('https://stats.nba.com/stats')
    expect(LIVE_BASE_URL).toBe('https://cdn.nba.com/static/json/liveData')
  })

  it('should have required endpoints', () => {
    expect(ENDPOINTS.PLAYER_CAREER_STATS).toBe('playercareerstats')
    expect(ENDPOINTS.LEAGUE_LEADERS).toBe('leagueleaders')
    expect(ENDPOINTS.LIVE_SCOREBOARD).toBe('scoreboard/todaysScoreboard_00.json')
  })

  it('should have correct season type values', () => {
    expect(SeasonType.REGULAR).toBe('Regular Season')
    expect(SeasonType.PLAYOFFS).toBe('Playoffs')
    expect(SeasonType.PRESEASON).toBe('Pre Season')
  })

  it('should have correct per mode values', () => {
    expect(PerMode.TOTALS).toBe('Totals')
    expect(PerMode.PER_GAME).toBe('PerGame')
    expect(PerMode.PER_36).toBe('Per36')
  })

  it('should have correct league ID values', () => {
    expect(LeagueID.NBA).toBe('00')
    expect(LeagueID.WNBA).toBe('10')
    expect(LeagueID.G_LEAGUE).toBe('20')
  })
})

describe('Season Utilities', () => {
  describe('getCurrentSeason', () => {
    it('should return a valid season string', () => {
      const season = getCurrentSeason()
      expect(season).toMatch(/^\d{4}-\d{2}$/)
    })
  })

  describe('formatSeason', () => {
    it('should format year to season string', () => {
      expect(formatSeason(2024)).toBe('2024-25')
      expect(formatSeason(2020)).toBe('2020-21')
      expect(formatSeason(1999)).toBe('1999-00')
    })
  })

  describe('parseSeasonYear', () => {
    it('should parse season string to start year', () => {
      expect(parseSeasonYear('2024-25')).toBe(2024)
      expect(parseSeasonYear('2020-21')).toBe(2020)
      expect(parseSeasonYear('1999-00')).toBe(1999)
    })

    it('should throw on invalid format', () => {
      expect(() => parseSeasonYear('2024')).toThrow()
      expect(() => parseSeasonYear('2024-2025')).toThrow()
    })
  })

  describe('validateSeason', () => {
    it('should accept valid seasons', () => {
      expect(() => validateSeason('2024-25')).not.toThrow()
      expect(() => validateSeason('2020-21')).not.toThrow()
      expect(() => validateSeason('1999-00')).not.toThrow()
    })

    it('should reject invalid format', () => {
      expect(() => validateSeason('2024')).toThrow()
      expect(() => validateSeason('24-25')).toThrow()
      expect(() => validateSeason('2024-26')).toThrow() // wrong suffix
    })

    it('should reject seasons before NBA founding', () => {
      expect(() => validateSeason('1945-46')).toThrow()
    })
  })

  describe('generateSeasonRange', () => {
    it('should generate range of seasons', () => {
      const range = generateSeasonRange(2020, 2024)
      expect(range).toEqual(['2020-21', '2021-22', '2022-23', '2023-24', '2024-25'])
    })

    it('should handle single season', () => {
      const range = generateSeasonRange(2024, 2024)
      expect(range).toEqual(['2024-25'])
    })

    it('should throw if start > end', () => {
      expect(() => generateSeasonRange(2024, 2020)).toThrow()
    })
  })
})

describe('Validation Functions', () => {
  describe('validatePlayerId', () => {
    it('should accept valid player IDs', () => {
      expect(() => validatePlayerId(2544)).not.toThrow() // LeBron
      expect(() => validatePlayerId(1)).not.toThrow()
    })

    it('should reject invalid player IDs', () => {
      expect(() => validatePlayerId(0)).toThrow()
      expect(() => validatePlayerId(-1)).toThrow()
      expect(() => validatePlayerId(1.5)).toThrow()
    })
  })

  describe('validateTeamId', () => {
    it('should accept valid team IDs', () => {
      expect(() => validateTeamId(1610612747)).not.toThrow() // Lakers
      expect(() => validateTeamId(1)).not.toThrow()
    })

    it('should reject invalid team IDs', () => {
      expect(() => validateTeamId(0)).toThrow()
      expect(() => validateTeamId(-1)).toThrow()
    })
  })

  describe('validateGameId', () => {
    it('should accept valid game IDs', () => {
      expect(() => validateGameId('0022400001')).not.toThrow()
      expect(() => validateGameId('1234567890')).not.toThrow()
    })

    it('should reject invalid game IDs', () => {
      expect(() => validateGameId('123')).toThrow()
      expect(() => validateGameId('00224000010')).toThrow() // 11 digits
      expect(() => validateGameId('abcdefghij')).toThrow()
    })
  })

  describe('validateDate', () => {
    it('should accept valid dates', () => {
      expect(() => validateDate('2025-01-15')).not.toThrow()
      expect(() => validateDate('2024-12-31')).not.toThrow()
    })

    it('should reject invalid date formats', () => {
      expect(() => validateDate('01-15-2025')).toThrow()
      expect(() => validateDate('2025/01/15')).toThrow()
      expect(() => validateDate('20250115')).toThrow()
    })
  })
})

describe('URL Building', () => {
  describe('buildStatsUrl', () => {
    it('should build URL without params', () => {
      const url = buildStatsUrl('playercareerstats')
      expect(url).toBe('https://stats.nba.com/stats/playercareerstats?')
    })

    it('should build URL with params', () => {
      const url = buildStatsUrl('playercareerstats', {
        PlayerID: 2544,
        PerMode: 'Totals',
      })
      expect(url).toContain('PlayerID=2544')
      expect(url).toContain('PerMode=Totals')
    })

    it('should exclude null/undefined params', () => {
      const url = buildStatsUrl('playercareerstats', {
        PlayerID: 2544,
        TeamID: null,
        LeagueID: undefined,
      })
      expect(url).toContain('PlayerID=2544')
      expect(url).not.toContain('TeamID')
      expect(url).not.toContain('LeagueID')
    })

    it('should sort params alphabetically', () => {
      const url = buildStatsUrl('test', {
        Z: 'last',
        A: 'first',
        M: 'middle',
      })
      // A should come before M should come before Z
      const aIndex = url.indexOf('A=first')
      const mIndex = url.indexOf('M=middle')
      const zIndex = url.indexOf('Z=last')
      expect(aIndex).toBeLessThan(mIndex)
      expect(mIndex).toBeLessThan(zIndex)
    })
  })

  describe('buildLiveUrl', () => {
    it('should build live URL without game ID', () => {
      const url = buildLiveUrl('scoreboard/todaysScoreboard_00.json')
      expect(url).toBe(
        'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json'
      )
    })

    it('should replace game ID placeholder', () => {
      const url = buildLiveUrl('boxscore/boxscore_{game_id}.json', '0022400001')
      expect(url).toBe(
        'https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022400001.json'
      )
    })
  })
})
