/**
 * NBA Teams Static Data
 *
 * Pre-loaded NBA team data for offline lookups.
 * Data sourced from nba_api Python package (updated November 2025).
 */
/**
 * All 30 NBA teams.
 */
export const teams = [
    { id: 1610612737, abbreviation: 'ATL', nickname: 'Hawks', yearFounded: 1949, city: 'Atlanta', fullName: 'Atlanta Hawks', state: 'Georgia' },
    { id: 1610612738, abbreviation: 'BOS', nickname: 'Celtics', yearFounded: 1946, city: 'Boston', fullName: 'Boston Celtics', state: 'Massachusetts' },
    { id: 1610612739, abbreviation: 'CLE', nickname: 'Cavaliers', yearFounded: 1970, city: 'Cleveland', fullName: 'Cleveland Cavaliers', state: 'Ohio' },
    { id: 1610612740, abbreviation: 'NOP', nickname: 'Pelicans', yearFounded: 2002, city: 'New Orleans', fullName: 'New Orleans Pelicans', state: 'Louisiana' },
    { id: 1610612741, abbreviation: 'CHI', nickname: 'Bulls', yearFounded: 1966, city: 'Chicago', fullName: 'Chicago Bulls', state: 'Illinois' },
    { id: 1610612742, abbreviation: 'DAL', nickname: 'Mavericks', yearFounded: 1980, city: 'Dallas', fullName: 'Dallas Mavericks', state: 'Texas' },
    { id: 1610612743, abbreviation: 'DEN', nickname: 'Nuggets', yearFounded: 1976, city: 'Denver', fullName: 'Denver Nuggets', state: 'Colorado' },
    { id: 1610612744, abbreviation: 'GSW', nickname: 'Warriors', yearFounded: 1946, city: 'San Francisco', fullName: 'Golden State Warriors', state: 'California' },
    { id: 1610612745, abbreviation: 'HOU', nickname: 'Rockets', yearFounded: 1967, city: 'Houston', fullName: 'Houston Rockets', state: 'Texas' },
    { id: 1610612746, abbreviation: 'LAC', nickname: 'Clippers', yearFounded: 1970, city: 'Los Angeles', fullName: 'Los Angeles Clippers', state: 'California' },
    { id: 1610612747, abbreviation: 'LAL', nickname: 'Lakers', yearFounded: 1948, city: 'Los Angeles', fullName: 'Los Angeles Lakers', state: 'California' },
    { id: 1610612748, abbreviation: 'MIA', nickname: 'Heat', yearFounded: 1988, city: 'Miami', fullName: 'Miami Heat', state: 'Florida' },
    { id: 1610612749, abbreviation: 'MIL', nickname: 'Bucks', yearFounded: 1968, city: 'Milwaukee', fullName: 'Milwaukee Bucks', state: 'Wisconsin' },
    { id: 1610612750, abbreviation: 'MIN', nickname: 'Timberwolves', yearFounded: 1989, city: 'Minnesota', fullName: 'Minnesota Timberwolves', state: 'Minnesota' },
    { id: 1610612751, abbreviation: 'BKN', nickname: 'Nets', yearFounded: 1976, city: 'Brooklyn', fullName: 'Brooklyn Nets', state: 'New York' },
    { id: 1610612752, abbreviation: 'NYK', nickname: 'Knicks', yearFounded: 1946, city: 'New York', fullName: 'New York Knicks', state: 'New York' },
    { id: 1610612753, abbreviation: 'ORL', nickname: 'Magic', yearFounded: 1989, city: 'Orlando', fullName: 'Orlando Magic', state: 'Florida' },
    { id: 1610612754, abbreviation: 'IND', nickname: 'Pacers', yearFounded: 1976, city: 'Indiana', fullName: 'Indiana Pacers', state: 'Indiana' },
    { id: 1610612755, abbreviation: 'PHI', nickname: '76ers', yearFounded: 1949, city: 'Philadelphia', fullName: 'Philadelphia 76ers', state: 'Pennsylvania' },
    { id: 1610612756, abbreviation: 'PHX', nickname: 'Suns', yearFounded: 1968, city: 'Phoenix', fullName: 'Phoenix Suns', state: 'Arizona' },
    { id: 1610612757, abbreviation: 'POR', nickname: 'Trail Blazers', yearFounded: 1970, city: 'Portland', fullName: 'Portland Trail Blazers', state: 'Oregon' },
    { id: 1610612758, abbreviation: 'SAC', nickname: 'Kings', yearFounded: 1948, city: 'Sacramento', fullName: 'Sacramento Kings', state: 'California' },
    { id: 1610612759, abbreviation: 'SAS', nickname: 'Spurs', yearFounded: 1976, city: 'San Antonio', fullName: 'San Antonio Spurs', state: 'Texas' },
    { id: 1610612760, abbreviation: 'OKC', nickname: 'Thunder', yearFounded: 1967, city: 'Oklahoma City', fullName: 'Oklahoma City Thunder', state: 'Oklahoma' },
    { id: 1610612761, abbreviation: 'TOR', nickname: 'Raptors', yearFounded: 1995, city: 'Toronto', fullName: 'Toronto Raptors', state: 'Ontario' },
    { id: 1610612762, abbreviation: 'UTA', nickname: 'Jazz', yearFounded: 1974, city: 'Utah', fullName: 'Utah Jazz', state: 'Utah' },
    { id: 1610612763, abbreviation: 'MEM', nickname: 'Grizzlies', yearFounded: 1995, city: 'Memphis', fullName: 'Memphis Grizzlies', state: 'Tennessee' },
    { id: 1610612764, abbreviation: 'WAS', nickname: 'Wizards', yearFounded: 1961, city: 'Washington', fullName: 'Washington Wizards', state: 'District of Columbia' },
    { id: 1610612765, abbreviation: 'DET', nickname: 'Pistons', yearFounded: 1948, city: 'Detroit', fullName: 'Detroit Pistons', state: 'Michigan' },
    { id: 1610612766, abbreviation: 'CHA', nickname: 'Hornets', yearFounded: 1988, city: 'Charlotte', fullName: 'Charlotte Hornets', state: 'North Carolina' },
];
/**
 * Find teams by name using regex pattern matching.
 * Searches full name, nickname, and city.
 * @param pattern - Regex pattern to match (case-insensitive)
 */
export function findTeamsByName(pattern) {
    const regex = new RegExp(pattern, 'i');
    return teams.filter((team) => regex.test(team.fullName) ||
        regex.test(team.nickname) ||
        regex.test(team.city));
}
/**
 * Find a team by its NBA team ID.
 * @param teamId - The NBA team ID
 */
export function findTeamById(teamId) {
    return teams.find((team) => team.id === teamId) ?? null;
}
/**
 * Find a team by its abbreviation (e.g., "LAL", "BOS").
 * @param abbreviation - The 3-letter team abbreviation (case-insensitive)
 */
export function findTeamByAbbreviation(abbreviation) {
    const upper = abbreviation.toUpperCase();
    return teams.find((team) => team.abbreviation === upper) ?? null;
}
/**
 * Find teams by state.
 * @param state - State name to match (case-insensitive)
 */
export function findTeamsByState(state) {
    const regex = new RegExp(state, 'i');
    return teams.filter((team) => regex.test(team.state));
}
/**
 * Find teams by city.
 * @param city - City name to match (case-insensitive)
 */
export function findTeamsByCity(city) {
    const regex = new RegExp(city, 'i');
    return teams.filter((team) => regex.test(team.city));
}
/**
 * Get all teams.
 */
export function getTeams() {
    return [...teams];
}
/**
 * Get all team abbreviations.
 */
export function getTeamAbbreviations() {
    return teams.map((team) => team.abbreviation);
}
/**
 * Get all team IDs.
 */
export function getTeamIds() {
    return teams.map((team) => team.id);
}
//# sourceMappingURL=teams.js.map