// Liquipedia API stub — implement once API key is approved
// Docs: https://api.liquipedia.net/documentation

const BASE_URL = 'https://api.liquipedia.net/api/v3';

function getHeaders() {
  return {
    'Authorization': `Apikey ${process.env.LIQUIPEDIA_KEY}`,
    'User-Agent': 'tm-ratings/1.0 (your@email.com)' // update with your email
  };
}

/**
 * Search for a player on Liquipedia by name
 * @param {string} name - Player name or pagename
 */
async function searchPlayer(name) {
  // TODO: uncomment once API key is active
  // const url = `${BASE_URL}/player?wiki=trackmania&conditions=[[pagename::${encodeURIComponent(name)}]]&limit=5`;
  // const res = await fetch(url, { headers: getHeaders() });
  // return res.json();
  console.log(`[Liquipedia stub] searchPlayer: ${name}`);
  return null;
}

/**
 * Get placements for a tournament by its Liquipedia pagename
 * @param {string} liquipediaId - Tournament pagename on Liquipedia
 */
async function getTournamentResults(liquipediaId) {
  // TODO: uncomment once API key is active
  // const url = `${BASE_URL}/placement?wiki=trackmania&conditions=[[pagename::${encodeURIComponent(liquipediaId)}]]&limit=50`;
  // const res = await fetch(url, { headers: getHeaders() });
  // return res.json();
  console.log(`[Liquipedia stub] getTournamentResults: ${liquipediaId}`);
  return null;
}

/**
 * Get recent TM tournaments
 */
async function getRecentTournaments() {
  // TODO: uncomment once API key is active
  // const url = `${BASE_URL}/tournament?wiki=trackmania&limit=20&order=date_tournament DESC`;
  // const res = await fetch(url, { headers: getHeaders() });
  // return res.json();
  console.log('[Liquipedia stub] getRecentTournaments');
  return null;
}

module.exports = { searchPlayer, getTournamentResults, getRecentTournaments };
