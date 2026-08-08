/**
 * Platform stat fetchers.
 * Each returns a normalized stats object:
 * {
 *   username, problems_solved, easy_solved, medium_solved, hard_solved,
 *   rating, max_rating, rank_title, acceptance_rate, last_synced
 * }
 */

const now = () => new Date().toISOString();

// ── LeetCode ──────────────────────────────────────────────────────────────────
// Uses the public leetcode-stats-api (no CORS issues)
export async function fetchLeetCodeStats(profileUrl) {
  const match = profileUrl.match(/leetcode\.com\/(?:u\/)?([^/?#]+)/i);
  const username = match?.[1]?.replace(/\/$/, '');
  if (!username) throw new Error('Invalid LeetCode URL. Expected: https://leetcode.com/u/yourname');

  const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
  if (!res.ok) throw new Error(`LeetCode user "${username}" not found`);
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'LeetCode user not found');

  return {
    username,
    problems_solved: data.totalSolved ?? 0,
    easy_solved: data.easySolved ?? 0,
    medium_solved: data.mediumSolved ?? 0,
    hard_solved: data.hardSolved ?? 0,
    rating: data.ranking ?? null,          // LeetCode ranking (lower = better)
    max_rating: null,
    rank_title: data.ranking ? `Rank #${data.ranking.toLocaleString()}` : null,
    acceptance_rate: data.acceptanceRate ?? null,
    last_synced: now(),
  };
}

// ── Codeforces ────────────────────────────────────────────────────────────────
export async function fetchCodeforcesStats(profileUrl) {
  const match = profileUrl.match(/codeforces\.com\/profile\/([^/?#]+)/i);
  const username = match?.[1];
  if (!username) throw new Error('Invalid Codeforces URL. Expected: https://codeforces.com/profile/yourname');

  const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
  const data = await res.json();
  if (data.status !== 'OK' || !data.result?.[0]) throw new Error('Codeforces user not found');

  const u = data.result[0];

  // Fetch submission count (unique accepted problems)
  let problems_solved = 0;
  try {
    const subRes = await fetch(
      `https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`
    );
    const subData = await subRes.json();
    if (subData.status === 'OK') {
      const accepted = new Set(
        subData.result
          .filter(s => s.verdict === 'OK')
          .map(s => `${s.problem.contestId}-${s.problem.index}`)
      );
      problems_solved = accepted.size;
    }
  } catch {
    // Non-critical — continue with 0
  }

  return {
    username: u.handle,
    problems_solved,
    easy_solved: 0,
    medium_solved: 0,
    hard_solved: 0,
    rating: u.rating ?? null,
    max_rating: u.maxRating ?? null,
    rank_title: u.rank ?? null,
    acceptance_rate: null,
    last_synced: now(),
  };
}

// ── GeeksForGeeks — no public API, manual entry ───────────────────────────────
export async function fetchGFGStats(profileUrl, manualData) {
  const match = profileUrl.match(/geeksforgeeks\.org\/user\/([^/?#]+)/i);
  const username = match?.[1] ?? profileUrl;
  return {
    username,
    problems_solved: manualData?.problems_solved ?? 0,
    easy_solved: manualData?.easy_solved ?? 0,
    medium_solved: manualData?.medium_solved ?? 0,
    hard_solved: manualData?.hard_solved ?? 0,
    rating: manualData?.score ?? null,
    max_rating: null,
    rank_title: manualData?.institute_rank ? `Institute Rank #${manualData.institute_rank}` : null,
    acceptance_rate: null,
    last_synced: now(),
  };
}

// ── CodeChef — no public API, manual entry ────────────────────────────────────
export async function fetchCodeChefStats(profileUrl, manualData) {
  const match = profileUrl.match(/codechef\.com\/users\/([^/?#]+)/i);
  const username = match?.[1] ?? profileUrl;
  return {
    username,
    problems_solved: manualData?.problems_solved ?? 0,
    easy_solved: 0,
    medium_solved: 0,
    hard_solved: 0,
    rating: manualData?.rating ?? null,
    max_rating: manualData?.max_rating ?? null,
    rank_title: manualData?.stars ? `${manualData.stars}★` : null,
    acceptance_rate: null,
    last_synced: now(),
  };
}

// ── HackerRank — no public API, manual entry ──────────────────────────────────
export async function fetchHackerRankStats(profileUrl, manualData) {
  const match = profileUrl.match(/hackerrank\.com\/([^/?#]+)/i);
  const username = match?.[1] ?? profileUrl;
  return {
    username,
    problems_solved: manualData?.problems_solved ?? 0,
    easy_solved: 0,
    medium_solved: 0,
    hard_solved: 0,
    rating: manualData?.score ?? null,
    max_rating: null,
    rank_title: null,
    acceptance_rate: null,
    last_synced: now(),
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export async function fetchPlatformStats(platform, profileUrl, manualData = {}) {
  switch (platform) {
    case 'leetcode':    return fetchLeetCodeStats(profileUrl);
    case 'codeforces':  return fetchCodeforcesStats(profileUrl);
    case 'geeksforgeeks': return fetchGFGStats(profileUrl, manualData);
    case 'codechef':    return fetchCodeChefStats(profileUrl, manualData);
    case 'hackerrank':  return fetchHackerRankStats(profileUrl, manualData);
    default: throw new Error(`Unknown platform: ${platform}`);
  }
}

export const PLATFORM_META = {
  leetcode:     { label: 'LeetCode',      icon: '🟡', color: 'hsl(38,92%,50%)',  hasLiveSync: true,  urlPattern: 'https://leetcode.com/u/yourname' },
  codeforces:   { label: 'Codeforces',    icon: '🔵', color: 'hsl(210,100%,52%)', hasLiveSync: true,  urlPattern: 'https://codeforces.com/profile/yourname' },
  geeksforgeeks:{ label: 'GeeksForGeeks', icon: '🟢', color: 'hsl(142,71%,45%)', hasLiveSync: false, urlPattern: 'https://www.geeksforgeeks.org/user/yourname' },
  codechef:     { label: 'CodeChef',      icon: '⭐', color: 'hsl(262,83%,58%)', hasLiveSync: false, urlPattern: 'https://www.codechef.com/users/yourname' },
  hackerrank:   { label: 'HackerRank',    icon: '🟢', color: 'hsl(142,60%,40%)', hasLiveSync: false, urlPattern: 'https://www.hackerrank.com/yourname' },
};

export const MANUAL_FIELDS = {
  geeksforgeeks: [
    { key: 'problems_solved', label: 'Problems Solved', type: 'number' },
    { key: 'easy_solved',     label: 'Easy Solved',     type: 'number' },
    { key: 'medium_solved',   label: 'Medium Solved',   type: 'number' },
    { key: 'hard_solved',     label: 'Hard Solved',     type: 'number' },
    { key: 'score',           label: 'GFG Score',       type: 'number' },
    { key: 'institute_rank',  label: 'Institute Rank',  type: 'number' },
  ],
  codechef: [
    { key: 'problems_solved', label: 'Problems Solved', type: 'number' },
    { key: 'rating',          label: 'Current Rating',  type: 'number' },
    { key: 'max_rating',      label: 'Max Rating',      type: 'number' },
    { key: 'stars',           label: 'Stars (1–7)',      type: 'number' },
  ],
  hackerrank: [
    { key: 'problems_solved', label: 'Problems Solved', type: 'number' },
    { key: 'score',           label: 'Hacker Score',    type: 'number' },
  ],
};
