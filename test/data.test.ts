/**
 * Static Data Tests
 */

import { describe, it, expect } from 'vitest'
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
} from '../src/data/teams.js'
import {
  players,
  findPlayerById,
  findPlayersByName,
  getActivePlayers,
  getInactivePlayers,
  getPlayers,
} from '../src/data/players.js'

describe('Teams Data', () => {
  describe('teams array', () => {
    it('should have 30 NBA teams', () => {
      expect(teams).toHaveLength(30)
    })

    it('should have required properties on each team', () => {
      for (const team of teams) {
        expect(team.id).toBeDefined()
        expect(typeof team.id).toBe('number')
        expect(team.abbreviation).toBeDefined()
        expect(team.abbreviation).toHaveLength(3)
        expect(team.fullName).toBeDefined()
        expect(team.city).toBeDefined()
        expect(team.state).toBeDefined()
        expect(team.yearFounded).toBeDefined()
      }
    })
  })

  describe('findTeamById', () => {
    it('should find Lakers by ID', () => {
      const team = findTeamById(1610612747)
      expect(team).not.toBeNull()
      expect(team?.abbreviation).toBe('LAL')
      expect(team?.fullName).toBe('Los Angeles Lakers')
    })

    it('should find Celtics by ID', () => {
      const team = findTeamById(1610612738)
      expect(team).not.toBeNull()
      expect(team?.abbreviation).toBe('BOS')
    })

    it('should return null for invalid ID', () => {
      const team = findTeamById(999999)
      expect(team).toBeNull()
    })
  })

  describe('findTeamByAbbreviation', () => {
    it('should find team by abbreviation (case insensitive)', () => {
      expect(findTeamByAbbreviation('LAL')?.fullName).toBe('Los Angeles Lakers')
      expect(findTeamByAbbreviation('lal')?.fullName).toBe('Los Angeles Lakers')
      expect(findTeamByAbbreviation('GSW')?.fullName).toBe('Golden State Warriors')
    })

    it('should return null for invalid abbreviation', () => {
      expect(findTeamByAbbreviation('XXX')).toBeNull()
    })
  })

  describe('findTeamsByName', () => {
    it('should find teams by regex pattern', () => {
      const laTeams = findTeamsByName('Los Angeles')
      expect(laTeams).toHaveLength(2) // Lakers and Clippers
      expect(laTeams.map((t) => t.abbreviation).sort()).toEqual(['LAC', 'LAL'])
    })

    it('should find teams by partial name', () => {
      const warriors = findTeamsByName('Warriors')
      expect(warriors).toHaveLength(1)
      expect(warriors[0]?.abbreviation).toBe('GSW')
    })

    it('should be case insensitive', () => {
      const bulls = findTeamsByName('bulls')
      expect(bulls).toHaveLength(1)
      expect(bulls[0]?.abbreviation).toBe('CHI')
    })
  })

  describe('findTeamsByCity', () => {
    it('should find teams by city', () => {
      const nyTeams = findTeamsByCity('New York')
      expect(nyTeams).toHaveLength(1) // Knicks (Nets are Brooklyn)
      expect(nyTeams[0]?.abbreviation).toBe('NYK')
    })
  })

  describe('findTeamsByState', () => {
    it('should find teams by state', () => {
      const caTeams = findTeamsByState('California')
      expect(caTeams).toHaveLength(4) // Warriors, Lakers, Clippers, Kings
    })

    it('should find teams in Texas', () => {
      const txTeams = findTeamsByState('Texas')
      expect(txTeams).toHaveLength(3) // Mavs, Rockets, Spurs
    })
  })

  describe('getTeams', () => {
    it('should return copy of teams array', () => {
      const allTeams = getTeams()
      expect(allTeams).toHaveLength(30)
      expect(allTeams).not.toBe(teams) // Should be a copy
    })
  })

  describe('getTeamAbbreviations', () => {
    it('should return all abbreviations', () => {
      const abbrs = getTeamAbbreviations()
      expect(abbrs).toHaveLength(30)
      expect(abbrs).toContain('LAL')
      expect(abbrs).toContain('BOS')
      expect(abbrs).toContain('GSW')
    })
  })

  describe('getTeamIds', () => {
    it('should return all team IDs', () => {
      const ids = getTeamIds()
      expect(ids).toHaveLength(30)
      expect(ids).toContain(1610612747) // Lakers
      expect(ids).toContain(1610612738) // Celtics
    })
  })
})

describe('Players Data', () => {
  describe('players array', () => {
    it('should have many players', () => {
      expect(players.length).toBeGreaterThan(5000)
    })

    it('should have required properties on each player', () => {
      // Check first few players
      for (const player of players.slice(0, 100)) {
        expect(player.id).toBeDefined()
        expect(typeof player.id).toBe('number')
        expect(player.fullName).toBeDefined()
        expect(typeof player.fullName).toBe('string')
        expect(player.firstName).toBeDefined()
        expect(player.lastName).toBeDefined()
        expect(typeof player.isActive).toBe('boolean')
      }
    })
  })

  describe('findPlayerById', () => {
    it('should find LeBron James by ID', () => {
      const player = findPlayerById(2544)
      expect(player).not.toBeNull()
      expect(player?.fullName).toBe('LeBron James')
      expect(player?.isActive).toBe(true)
    })

    it('should find Stephen Curry by ID', () => {
      const player = findPlayerById(201939)
      expect(player).not.toBeNull()
      expect(player?.fullName).toBe('Stephen Curry')
    })

    it('should return null for invalid ID', () => {
      const player = findPlayerById(-1)
      expect(player).toBeNull()
    })
  })

  describe('findPlayersByName', () => {
    it('should find players by name pattern', () => {
      const lebrons = findPlayersByName('LeBron')
      expect(lebrons.length).toBeGreaterThanOrEqual(1)
      expect(lebrons.some((p) => p.fullName === 'LeBron James')).toBe(true)
    })

    it('should be case insensitive', () => {
      const currys = findPlayersByName('curry')
      expect(currys.length).toBeGreaterThanOrEqual(1)
      expect(currys.some((p) => p.fullName === 'Stephen Curry')).toBe(true)
    })

    it('should find by last name', () => {
      const jordans = findPlayersByName('Jordan')
      expect(jordans.length).toBeGreaterThanOrEqual(1)
      expect(jordans.some((p) => p.fullName === 'Michael Jordan')).toBe(true)
    })
  })

  describe('getActivePlayers', () => {
    it('should return only active players', () => {
      const active = getActivePlayers()
      expect(active.length).toBeGreaterThan(0)
      expect(active.every((p) => p.isActive === true)).toBe(true)
    })

    it('should include current stars', () => {
      const active = getActivePlayers()
      const names = active.map((p) => p.fullName)
      expect(names).toContain('LeBron James')
      expect(names).toContain('Stephen Curry')
    })
  })

  describe('getInactivePlayers', () => {
    it('should return only inactive players', () => {
      const inactive = getInactivePlayers()
      expect(inactive.length).toBeGreaterThan(0)
      expect(inactive.every((p) => p.isActive === false)).toBe(true)
    })

    it('should include retired legends', () => {
      const inactive = getInactivePlayers()
      const names = inactive.map((p) => p.fullName)
      expect(names).toContain('Michael Jordan')
      expect(names).toContain('Kobe Bryant')
    })
  })

  describe('getPlayers', () => {
    it('should return copy of players array', () => {
      const allPlayers = getPlayers()
      expect(allPlayers.length).toBe(players.length)
      expect(allPlayers).not.toBe(players) // Should be a copy
    })
  })
})
