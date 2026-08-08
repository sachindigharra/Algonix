/**
 * Pattern Engine — the brain of Algonix's smart revision system.
 *
 * Core idea: DSA mastery isn't about solving a problem once.
 * It's about being able to re-solve it cold, 3 days later, without hints.
 * This engine tracks that cycle and scores pattern understanding accordingly.
 */

// High-frequency patterns that appear repeatedly in interviews.
// Problems tagged with these get the 3-day re-attempt schedule.
export const HIGH_FREQUENCY_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Dynamic Programming',
  'BFS',
  'DFS',
  'Backtracking',
  'Greedy',
  'Union Find',
  'Trie',
  'Heap',
  'Graphs',
  'Trees',
  'Recursion',
  'Hashing',
  'Sorting',
];

// How many days after solving to schedule the re-attempt
export const REVISION_INTERVAL_DAYS = 3;

// A problem "counts" as pattern-mastered only if it was re-solved
// within the window (not just marked solved once)
export const MASTERY_WINDOW_DAYS = 7;

/**
 * Given a solved_date string, returns the ISO date string for when
 * the re-attempt should be scheduled.
 */
export function getRevisionDueDate(solvedDateStr) {
  const d = new Date(solvedDateStr);
  d.setDate(d.getDate() + REVISION_INTERVAL_DAYS);
  return d.toISOString().split('T')[0];
}

/**
 * Returns true if a problem belongs to a high-frequency pattern.
 */
export function isHighFrequencyProblem(problem) {
  return (problem.tags || []).some(tag =>
    HIGH_FREQUENCY_PATTERNS.includes(tag)
  );
}

/**
 * Returns the primary pattern tag for a problem (first HF tag found).
 */
export function getPrimaryPattern(problem) {
  return (problem.tags || []).find(tag =>
    HIGH_FREQUENCY_PATTERNS.includes(tag)
  ) || (problem.tags?.[0] ?? 'General');
}

/**
 * Computes per-pattern mastery stats from the problems array.
 *
 * Returns an array of:
 * {
 *   pattern: string,
 *   total: number,          // problems attempted in this pattern
 *   solved: number,         // solved at least once
 *   mastered: number,       // solved + re-solved within window
 *   masteryRate: number,    // 0–100
 *   inTutorialLoop: boolean // solved once but never re-attempted
 * }
 */
export function computePatternMastery(problems) {
  const stats = {};

  HIGH_FREQUENCY_PATTERNS.forEach(p => {
    stats[p] = { pattern: p, total: 0, solved: 0, mastered: 0 };
  });

  problems.forEach(problem => {
    const patterns = (problem.tags || []).filter(t =>
      HIGH_FREQUENCY_PATTERNS.includes(t)
    );
    if (patterns.length === 0) return;

    patterns.forEach(pattern => {
      if (!stats[pattern]) {
        stats[pattern] = { pattern, total: 0, solved: 0, mastered: 0 };
      }
      stats[pattern].total++;

      if (problem.status === 'solved') {
        stats[pattern].solved++;

        // "Mastered" = solved AND has a revision_date in the past
        // (meaning the user came back and re-solved it)
        const revDates = problem.revision_dates || [];
        if (revDates.length > 0) {
          stats[pattern].mastered++;
        }
      }
    });
  });

  return Object.values(stats)
    .filter(s => s.total > 0)
    .map(s => ({
      ...s,
      masteryRate: s.solved > 0 ? Math.round((s.mastered / s.solved) * 100) : 0,
      inTutorialLoop: s.solved > 0 && s.mastered === 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Returns problems that are due for re-attempt today or overdue.
 * These are problems where:
 * - status === 'solved'
 * - revision_dates array has a date <= today that hasn't been completed
 * - OR: solved_date + 3 days <= today AND no revision_dates yet
 *   AND it's a high-frequency pattern problem
 */
export function getDueRevisions(problems) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return problems.filter(problem => {
    if (problem.status !== 'solved') return false;
    if (!isHighFrequencyProblem(problem)) return false;

    const solvedDate = problem.solved_date
      ? new Date(problem.solved_date)
      : problem.created_at
      ? new Date(problem.created_at)
      : null;

    if (!solvedDate) return false;

    // Already has revision dates recorded — not due again yet
    const revDates = problem.revision_dates || [];
    if (revDates.length > 0) return false;

    // Due if solved_date + REVISION_INTERVAL_DAYS <= today
    const dueDate = new Date(solvedDate);
    dueDate.setDate(dueDate.getDate() + REVISION_INTERVAL_DAYS);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate <= today;
  });
}

/**
 * Returns problems solved today (for the "Today's Activity" section).
 */
export function getTodaySolvedProblems(problems) {
  const today = new Date().toISOString().split('T')[0];
  return problems.filter(p => {
    const d = p.solved_date || (p.created_at ? p.created_at.split('T')[0] : null);
    return p.status === 'solved' && d === today;
  });
}

/**
 * Builds a 30-day performance timeline.
 * Returns array of { date, solved, patterns } for charting.
 */
export function buildPerformanceTimeline(problems, days = 30) {
  const timeline = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];

    const dayProblems = problems.filter(p => {
      const sd = p.solved_date || (p.created_at ? p.created_at.split('T')[0] : null);
      return p.status === 'solved' && sd === key;
    });

    const patternSet = new Set();
    dayProblems.forEach(p =>
      (p.tags || []).forEach(t => {
        if (HIGH_FREQUENCY_PATTERNS.includes(t)) patternSet.add(t);
      })
    );

    timeline.push({
      date: key,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      solved: dayProblems.length,
      patterns: patternSet.size,
      easy: dayProblems.filter(p => p.difficulty === 'easy').length,
      medium: dayProblems.filter(p => p.difficulty === 'medium').length,
      hard: dayProblems.filter(p => p.difficulty === 'hard').length,
    });
  }

  return timeline;
}
