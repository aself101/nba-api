/**
 * Utils Module Tests
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  toCamelCase,
  normalizeKeys,
  normalizeResponse,
  pause,
  randomDelay,
  createLogger,
  ProgressReporter,
  writeToFile,
  readFromFile,
  fetchStats,
  createFetchClient,
} from '../src/utils.js'

describe('Case Conversion', () => {
  describe('toCamelCase', () => {
    it('should convert UPPER_SNAKE_CASE to camelCase', () => {
      expect(toCamelCase('PLAYER_ID')).toBe('playerId')
      expect(toCamelCase('TEAM_ABBREVIATION')).toBe('teamAbbreviation')
      expect(toCamelCase('FG_PCT')).toBe('fgPct')
    })

    it('should handle single word', () => {
      expect(toCamelCase('POINTS')).toBe('points')
      expect(toCamelCase('AST')).toBe('ast')
    })

    it('should handle multiple underscores', () => {
      expect(toCamelCase('PLAYER_FIRST_NAME')).toBe('playerFirstName')
    })
  })

  describe('normalizeKeys', () => {
    it('should convert all keys to camelCase', () => {
      const input = {
        PLAYER_ID: 2544,
        PLAYER_NAME: 'LeBron James',
        TEAM_ABBREVIATION: 'LAL',
      }
      const result = normalizeKeys(input)
      expect(result).toEqual({
        playerId: 2544,
        playerName: 'LeBron James',
        teamAbbreviation: 'LAL',
      })
    })

    it('should preserve values', () => {
      const input = {
        PTS: 25.5,
        IS_ACTIVE: true,
        STATS: null,
      }
      const result = normalizeKeys(input)
      expect(result.pts).toBe(25.5)
      expect(result.isActive).toBe(true)
      expect(result.stats).toBeNull()
    })

    it('should preserve type with mapped keys', () => {
      const input = {
        PLAYER_ID: 2544 as const,
        PLAYER_NAME: 'LeBron James' as const,
        FG_PCT: 0.506 as const,
      }
      const result = normalizeKeys(input)
      // Type test - these should be the correct keys
      expect(result.playerId).toBe(2544)
      expect(result.playerName).toBe('LeBron James')
      expect(result.fgPct).toBe(0.506)
    })
  })
})

describe('Response Normalization', () => {
  describe('normalizeResponse', () => {
    it('should normalize resultSets array', () => {
      const raw = {
        resultSets: [
          {
            name: 'PlayerStats',
            headers: ['PLAYER_ID', 'PLAYER_NAME', 'PTS'],
            rowSet: [
              [2544, 'LeBron James', 25.5],
              [201939, 'Stephen Curry', 28.1],
            ],
          },
        ],
      }

      const result = normalizeResponse(raw)
      expect(result).toHaveProperty('PlayerStats')
      expect(result.PlayerStats).toHaveLength(2)
      expect(result.PlayerStats?.[0]).toEqual({
        PLAYER_ID: 2544,
        PLAYER_NAME: 'LeBron James',
        PTS: 25.5,
      })
    })

    it('should normalize single resultSet', () => {
      const raw = {
        resultSet: {
          name: 'LeagueLeaders',
          headers: ['RANK', 'PLAYER', 'PTS'],
          rowSet: [[1, 'Luka Doncic', 33.9]],
        },
      }

      const result = normalizeResponse(raw)
      expect(result).toHaveProperty('LeagueLeaders')
      expect(result.LeagueLeaders?.[0]).toEqual({
        RANK: 1,
        PLAYER: 'Luka Doncic',
        PTS: 33.9,
      })
    })

    it('should handle multiple resultSets', () => {
      const raw = {
        resultSets: [
          {
            name: 'SeasonTotalsRegularSeason',
            headers: ['SEASON_ID', 'PTS'],
            rowSet: [['2024-25', 1500]],
          },
          {
            name: 'SeasonTotalsPostSeason',
            headers: ['SEASON_ID', 'PTS'],
            rowSet: [['2024-25', 300]],
          },
        ],
      }

      const result = normalizeResponse(raw)
      expect(Object.keys(result)).toHaveLength(2)
      expect(result).toHaveProperty('SeasonTotalsRegularSeason')
      expect(result).toHaveProperty('SeasonTotalsPostSeason')
    })

    it('should return empty object for unexpected format', () => {
      const raw = { data: 'unexpected' }
      const result = normalizeResponse(raw as never)
      expect(result).toEqual({})
    })
  })
})

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('pause', () => {
    it('should pause for specified duration', async () => {
      const pausePromise = pause(1000)
      vi.advanceTimersByTime(1000)
      await pausePromise
      // If we get here without hanging, the test passes
    })
  })

  describe('randomDelay', () => {
    it('should return value within range', () => {
      for (let i = 0; i < 100; i++) {
        const delay = randomDelay(1000, 3000)
        expect(delay).toBeGreaterThanOrEqual(1000)
        expect(delay).toBeLessThanOrEqual(3000)
      }
    })

    it('should use default values', () => {
      const delay = randomDelay()
      expect(delay).toBeGreaterThanOrEqual(1000)
      expect(delay).toBeLessThanOrEqual(3000)
    })
  })
})

describe('Logging', () => {
  describe('createLogger', () => {
    it('should create a logger with default level', () => {
      const logger = createLogger()
      expect(logger).toBeDefined()
      expect(logger.level).toBe('info')
    })

    it('should create a logger with specified level', () => {
      const debugLogger = createLogger('DEBUG')
      expect(debugLogger.level).toBe('debug')

      const errorLogger = createLogger('ERROR')
      expect(errorLogger.level).toBe('error')
    })

    it('should handle WARNING level', () => {
      const warnLogger = createLogger('WARNING')
      expect(warnLogger.level).toBe('warn')
    })

    it('should be silent for NONE level', () => {
      const silentLogger = createLogger('NONE')
      expect(silentLogger.silent).toBe(true)
    })
  })
})

describe('ProgressReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('logFetch', () => {
    it('should log fetch message', () => {
      const reporter = new ProgressReporter()
      reporter.logFetch('leagueLeaders')
      expect(consoleSpy).toHaveBeenCalledWith('Fetching: leagueLeaders')
    })

    it('should log with params', () => {
      const reporter = new ProgressReporter()
      reporter.logFetch('playerCareer', { playerId: 2544 })
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('playerCareer')
      )
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('2544'))
    })

    it('should not log when quiet', () => {
      const reporter = new ProgressReporter({ quiet: true })
      reporter.logFetch('test')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should output JSON when json mode', () => {
      const reporter = new ProgressReporter({ json: true })
      reporter.logFetch('test')
      const call = consoleSpy.mock.calls[0]?.[0]
      expect(() => JSON.parse(call as string)).not.toThrow()
    })
  })

  describe('logSuccess', () => {
    it('should log success message', () => {
      const reporter = new ProgressReporter()
      reporter.logSuccess('test', '/path/to/file.json')
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('test'))
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('/path/to/file.json')
      )
    })
  })

  describe('logError', () => {
    it('should log error message', () => {
      const reporter = new ProgressReporter()
      reporter.logError('test', 'Something went wrong')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('test')
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Something went wrong')
      )
    })

    it('should log error even when quiet', () => {
      const reporter = new ProgressReporter({ quiet: true })
      reporter.logError('test', 'Error message')
      // Errors should still be logged in quiet mode
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('logProgress', () => {
    it('should log progress', () => {
      const reporter = new ProgressReporter()
      reporter.logProgress(5, 10, 'Processing items')
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[5/10]'))
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing items')
      )
    })

    it('should not log progress when quiet', () => {
      const reporter = new ProgressReporter({ quiet: true })
      reporter.logProgress(5, 10, 'Processing items')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should log progress as JSON when json mode', () => {
      const reporter = new ProgressReporter({ json: true })
      reporter.logProgress(5, 10, 'Processing items')
      const call = consoleSpy.mock.calls[0]?.[0] as string
      const parsed = JSON.parse(call)
      expect(parsed.event).toBe('progress')
      expect(parsed.current).toBe(5)
      expect(parsed.total).toBe(10)
    })
  })

  describe('logSkip', () => {
    it('should log skip message', () => {
      const reporter = new ProgressReporter()
      reporter.logSkip('endpoint', 'Already cached')
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('endpoint'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Already cached'))
    })

    it('should not log skip when quiet', () => {
      const reporter = new ProgressReporter({ quiet: true })
      reporter.logSkip('endpoint', 'Reason')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should log skip as JSON when json mode', () => {
      const reporter = new ProgressReporter({ json: true })
      reporter.logSkip('endpoint', 'Reason')
      const call = consoleSpy.mock.calls[0]?.[0] as string
      const parsed = JSON.parse(call)
      expect(parsed.event).toBe('skip')
      expect(parsed.endpoint).toBe('endpoint')
      expect(parsed.reason).toBe('Reason')
    })
  })

  describe('logInfo', () => {
    it('should log info message', () => {
      const reporter = new ProgressReporter()
      reporter.logInfo('Information message')
      expect(consoleSpy).toHaveBeenCalledWith('Information message')
    })

    it('should not log info when quiet', () => {
      const reporter = new ProgressReporter({ quiet: true })
      reporter.logInfo('Information message')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should log info as JSON when json mode', () => {
      const reporter = new ProgressReporter({ json: true })
      reporter.logInfo('Information message')
      const call = consoleSpy.mock.calls[0]?.[0] as string
      const parsed = JSON.parse(call)
      expect(parsed.event).toBe('info')
      expect(parsed.message).toBe('Information message')
    })
  })

  describe('logHeader', () => {
    it('should log header with formatting', () => {
      const reporter = new ProgressReporter()
      reporter.logHeader('Section Title')
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Section Title'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('==='))
    })

    it('should not log header when quiet', () => {
      const reporter = new ProgressReporter({ quiet: true })
      reporter.logHeader('Section Title')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should not log header when json mode', () => {
      const reporter = new ProgressReporter({ json: true })
      reporter.logHeader('Section Title')
      // Headers are omitted in JSON mode since they're just visual formatting
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })

  describe('logSuccess in modes', () => {
    it('should not log success when quiet', () => {
      const reporter = new ProgressReporter({ quiet: true })
      reporter.logSuccess('endpoint', '/path/file.json')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should log success as JSON when json mode', () => {
      const reporter = new ProgressReporter({ json: true })
      reporter.logSuccess('endpoint', '/path/file.json')
      const call = consoleSpy.mock.calls[0]?.[0] as string
      const parsed = JSON.parse(call)
      expect(parsed.event).toBe('success')
      expect(parsed.endpoint).toBe('endpoint')
      expect(parsed.filepath).toBe('/path/file.json')
    })
  })

  describe('logError in modes', () => {
    it('should log error as JSON when json mode', () => {
      const reporter = new ProgressReporter({ json: true })
      reporter.logError('endpoint', 'Error message')
      const call = consoleSpy.mock.calls[0]?.[0] as string
      const parsed = JSON.parse(call)
      expect(parsed.event).toBe('error')
      expect(parsed.endpoint).toBe('endpoint')
      expect(parsed.error).toBe('Error message')
    })
  })
})

describe('File I/O', () => {
  const testDir = path.join(process.cwd(), 'test-output-temp')

  beforeEach(() => {
    // Clean up test directory before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
  })

  describe('writeToFile', () => {
    it('should write JSON file with directory creation', () => {
      const data = { player: 'LeBron', points: 25 }
      const filepath = path.join(testDir, 'stats', 'player.json')

      writeToFile(data, filepath)

      expect(fs.existsSync(filepath)).toBe(true)
      const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
      expect(content).toEqual(data)
    })

    it('should write nested JSON with proper formatting', () => {
      const data = {
        season: '2024-25',
        stats: {
          points: 25.5,
          rebounds: 7.2,
          assists: 8.1,
        },
      }
      const filepath = path.join(testDir, 'nested.json')

      writeToFile(data, filepath)

      const content = fs.readFileSync(filepath, 'utf-8')
      // Should be pretty-printed with 2 spaces
      expect(content).toContain('  "season"')
    })

    it('should write CSV file from array of objects', () => {
      const data = [
        { name: 'LeBron', pts: 25, reb: 7 },
        { name: 'Curry', pts: 28, reb: 5 },
      ]
      const filepath = path.join(testDir, 'stats.csv')

      writeToFile(data, filepath)

      expect(fs.existsSync(filepath)).toBe(true)
      const content = fs.readFileSync(filepath, 'utf-8')
      expect(content).toContain('name,pts,reb')
      expect(content).toContain('LeBron,25,7')
      expect(content).toContain('Curry,28,5')
    })

    it('should handle CSV values with commas by quoting', () => {
      const data = [{ name: 'James, LeBron', team: 'Los Angeles Lakers' }]
      const filepath = path.join(testDir, 'quoted.csv')

      writeToFile(data, filepath)

      const content = fs.readFileSync(filepath, 'utf-8')
      expect(content).toContain('"James, LeBron"')
    })

    it('should handle CSV values with quotes by escaping', () => {
      const data = [{ quote: 'He said "hello"', value: 123 }]
      const filepath = path.join(testDir, 'escaped.csv')

      writeToFile(data, filepath)

      const content = fs.readFileSync(filepath, 'utf-8')
      expect(content).toContain('""hello""')
    })

    it('should handle CSV values with newlines', () => {
      const data = [{ bio: 'Line 1\nLine 2', id: 1 }]
      const filepath = path.join(testDir, 'newlines.csv')

      writeToFile(data, filepath)

      const content = fs.readFileSync(filepath, 'utf-8')
      expect(content).toContain('"Line 1\nLine 2"')
    })

    it('should handle null and undefined values in CSV', () => {
      const data = [{ name: 'Test', value: null, other: undefined }]
      const filepath = path.join(testDir, 'nulls.csv')

      writeToFile(data, filepath)

      const content = fs.readFileSync(filepath, 'utf-8')
      expect(content).toContain('name,value,other')
      expect(content).toContain('Test,,')
    })

    it('should return empty string for empty array when writing CSV', () => {
      const data: unknown[] = []
      const filepath = path.join(testDir, 'empty.csv')

      writeToFile(data, filepath)

      const content = fs.readFileSync(filepath, 'utf-8')
      expect(content).toBe('')
    })

    it('should use explicit format parameter over extension', () => {
      const data = [{ name: 'Test' }]
      const filepath = path.join(testDir, 'data.txt')

      writeToFile(data, filepath, 'csv')

      const content = fs.readFileSync(filepath, 'utf-8')
      expect(content).toContain('name')
      expect(content).toContain('Test')
    })

    it('should create deeply nested directories', () => {
      const data = { test: true }
      const filepath = path.join(testDir, 'a', 'b', 'c', 'd', 'deep.json')

      writeToFile(data, filepath)

      expect(fs.existsSync(filepath)).toBe(true)
    })
  })

  describe('readFromFile', () => {
    it('should read JSON file and parse it', () => {
      const data = { player: 'Curry', team: 'Warriors' }
      const filepath = path.join(testDir, 'read.json')

      fs.mkdirSync(testDir, { recursive: true })
      fs.writeFileSync(filepath, JSON.stringify(data))

      const result = readFromFile(filepath)
      expect(result).toEqual(data)
    })

    it('should read non-JSON file as string', () => {
      const content = 'This is plain text'
      const filepath = path.join(testDir, 'plain.txt')

      fs.mkdirSync(testDir, { recursive: true })
      fs.writeFileSync(filepath, content)

      const result = readFromFile(filepath)
      expect(result).toBe(content)
    })

    it('should throw error for non-existent file', () => {
      const filepath = path.join(testDir, 'does-not-exist.json')

      expect(() => readFromFile(filepath)).toThrow('File not found')
    })

    it('should read file with nested JSON', () => {
      const data = {
        seasons: [
          { year: '2023-24', pts: 25.7 },
          { year: '2022-23', pts: 28.9 },
        ],
      }
      const filepath = path.join(testDir, 'nested.json')

      fs.mkdirSync(testDir, { recursive: true })
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2))

      const result = readFromFile(filepath)
      expect(result).toEqual(data)
    })
  })
})

describe('HTTP Client', () => {
  describe('createFetchClient', () => {
    it('should create a fetch client with default headers', () => {
      const client = createFetchClient()
      expect(client).toBeDefined()
      expect(typeof client.get).toBe('function')
    })

    it('should create a fetch client with custom headers', () => {
      const client = createFetchClient({ 'X-Custom': 'header' })
      expect(client).toBeDefined()
    })
  })

  describe('fetchStats', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('should use tier1 client by default', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            resultSets: [
              {
                name: 'TestData',
                headers: ['ID', 'VALUE'],
                rowSet: [[1, 'test']],
              },
            ],
          }),
      }
      fetchSpy.mockResolvedValue(mockResponse as Response)

      const result = await fetchStats('test-endpoint', { param: 'value' })

      expect(fetchSpy).toHaveBeenCalled()
      expect(result.data).toHaveProperty('TestData')
      expect(result.statusCode).toBe(200)
    })

    it('should throw on HTTP error with tier1', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Access denied',
      }
      fetchSpy.mockResolvedValue(mockResponse as Response)

      await expect(fetchStats('test-endpoint', {}, { clientTier: 'tier1' })).rejects.toThrow(
        'HTTP 403: Forbidden'
      )
    })

    it('should throw on invalid JSON response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: async () => 'not valid json',
      }
      fetchSpy.mockResolvedValue(mockResponse as Response)

      await expect(fetchStats('test-endpoint', {}, { clientTier: 'tier1' })).rejects.toThrow(
        'Invalid JSON response'
      )
    })

    it('should build URL with sorted parameters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ resultSets: [] }),
      }
      fetchSpy.mockResolvedValue(mockResponse as Response)

      await fetchStats('leagueleaders', { Zebra: 'last', Alpha: 'first' })

      const calledUrl = fetchSpy.mock.calls[0]?.[0] as string
      expect(calledUrl).toContain('Alpha=first')
      expect(calledUrl).toContain('Zebra=last')
      expect(calledUrl.indexOf('Alpha')).toBeLessThan(calledUrl.indexOf('Zebra'))
    })

    it('should skip null, undefined, and empty string parameters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ resultSets: [] }),
      }
      fetchSpy.mockResolvedValue(mockResponse as Response)

      await fetchStats('test', { keep: 'value', skip: null, empty: '', undef: undefined })

      const calledUrl = fetchSpy.mock.calls[0]?.[0] as string
      expect(calledUrl).toContain('keep=value')
      expect(calledUrl).not.toContain('skip')
      expect(calledUrl).not.toContain('empty')
      expect(calledUrl).not.toContain('undef')
    })

    it('should handle network errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      await expect(fetchStats('test', {}, { clientTier: 'tier1' })).rejects.toThrow('Network error')
    })

    it('should include raw response in result', async () => {
      const rawData = {
        resultSets: [{ name: 'Data', headers: ['A'], rowSet: [[1]] }],
      }
      const mockResponse = {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(rawData),
      }
      fetchSpy.mockResolvedValue(mockResponse as Response)

      const result = await fetchStats('test')

      expect(result.raw).toEqual(rawData)
    })

    it('should normalize response data', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            resultSets: [
              {
                name: 'Players',
                headers: ['PLAYER_ID', 'PLAYER_NAME'],
                rowSet: [[2544, 'LeBron James']],
              },
            ],
          }),
      }
      fetchSpy.mockResolvedValue(mockResponse as Response)

      const result = await fetchStats('test')

      expect(result.data).toHaveProperty('Players')
      expect(result.data.Players?.[0]).toEqual({
        PLAYER_ID: 2544,
        PLAYER_NAME: 'LeBron James',
      })
    })
  })
})
