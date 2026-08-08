/**
 * Study Roadmap — two modes:
 * - 'generic'  : Pattern-based path (custom ordering)
 * - 'tuf_az'   : Striver's A-Z DSA Sheet (exact step sequence from TakeUForward)
 */

// ── Generic Roadmap ───────────────────────────────────────────────────────────
export const ROADMAP = [
  { id: 'arrays',          label: 'Arrays & Hashing',           icon: '📦', color: 'hsl(210,100%,52%)', minProblems: 8,  patterns: ['Arrays','Hashing','Sorting'],                    description: 'Foundation of everything. Prefix sums, frequency maps, in-place operations.',                                prerequisites: [] },
  { id: 'two_pointers',    label: 'Two Pointers',                icon: '👆', color: 'hsl(142,71%,45%)',  minProblems: 5,  patterns: ['Two Pointers'],                                  description: 'Shrink/expand from both ends. Pair sum, container with most water, 3Sum.',                                   prerequisites: ['arrays'] },
  { id: 'sliding_window',  label: 'Sliding Window',              icon: '🪟', color: 'hsl(38,92%,50%)',   minProblems: 5,  patterns: ['Sliding Window'],                                description: 'Fixed and variable windows. Longest substring, max sum subarray.',                                           prerequisites: ['arrays','two_pointers'] },
  { id: 'binary_search',   label: 'Binary Search',               icon: '🔍', color: 'hsl(262,83%,58%)',  minProblems: 6,  patterns: ['Binary Search'],                                 description: 'Search on sorted arrays, rotated arrays, and answer spaces.',                                                prerequisites: ['arrays'] },
  { id: 'strings',         label: 'Strings',                     icon: '🔤', color: 'hsl(180,60%,45%)',  minProblems: 6,  patterns: ['Strings'],                                       description: 'Anagrams, palindromes, string matching. Often combined with sliding window.',                                prerequisites: ['arrays','sliding_window'] },
  { id: 'linked_list',     label: 'Linked List',                 icon: '🔗', color: 'hsl(300,60%,50%)',  minProblems: 6,  patterns: ['Linked List'],                                   description: 'Fast/slow pointers, reversal, merge. Classic interview staple.',                                             prerequisites: ['two_pointers'] },
  { id: 'stack_queue',     label: 'Stack & Queue',               icon: '📚', color: 'hsl(0,84%,60%)',    minProblems: 5,  patterns: ['Stack','Queue'],                                 description: 'Monotonic stack, next greater element, valid parentheses.',                                                  prerequisites: ['arrays'] },
  { id: 'recursion_basics',label: 'Recursion & Backtracking',    icon: '🔄', color: 'hsl(38,92%,50%)',   minProblems: 6,  patterns: ['Recursion','Backtracking'],                      description: 'Subsets, permutations, N-Queens. Build the recursive thinking muscle.',                                      prerequisites: ['arrays'] },
  { id: 'trees',           label: 'Trees',                       icon: '🌳', color: 'hsl(142,71%,45%)',  minProblems: 8,  patterns: ['Trees','Recursion'],                             description: 'BST operations, tree traversals, LCA, diameter, path sum.',                                                 prerequisites: ['recursion_basics'] },
  { id: 'heap',            label: 'Heap / Priority Queue',       icon: '⛰️', color: 'hsl(210,100%,52%)', minProblems: 5,  patterns: ['Heap'],                                          description: 'Top-K elements, merge K sorted lists, median from stream.',                                                 prerequisites: ['arrays','trees'] },
  { id: 'graphs',          label: 'Graphs — BFS & DFS',          icon: '🕸️', color: 'hsl(262,83%,58%)',  minProblems: 8,  patterns: ['Graphs','BFS','DFS'],                            description: 'Grid traversal, connected components, shortest path, cycle detection.',                                     prerequisites: ['trees','recursion_basics'] },
  { id: 'union_find',      label: 'Union Find',                  icon: '🔀', color: 'hsl(180,60%,45%)',  minProblems: 4,  patterns: ['Union Find'],                                    description: 'Disjoint sets, number of islands variant, redundant connections.',                                           prerequisites: ['graphs'] },
  { id: 'trie',            label: 'Trie',                        icon: '🌐', color: 'hsl(300,60%,50%)',  minProblems: 4,  patterns: ['Trie'],                                          description: 'Prefix trees for word search, autocomplete, word dictionary.',                                              prerequisites: ['trees'] },
  { id: 'dp_1d',           label: 'Dynamic Programming — 1D',    icon: '🧩', color: 'hsl(0,84%,60%)',    minProblems: 8,  patterns: ['Dynamic Programming'],                           description: 'Fibonacci variants, climbing stairs, house robber, coin change.',                                           prerequisites: ['recursion_basics'] },
  { id: 'dp_2d',           label: 'Dynamic Programming — 2D',    icon: '🗺️', color: 'hsl(38,92%,50%)',   minProblems: 6,  patterns: ['Dynamic Programming'],                           description: 'Grid DP, LCS, edit distance, knapsack.',                                                                    prerequisites: ['dp_1d'] },
  { id: 'greedy',          label: 'Greedy',                      icon: '💰', color: 'hsl(142,71%,45%)',  minProblems: 5,  patterns: ['Greedy'],                                        description: 'Interval scheduling, jump game, gas station. Local optimal → global.',                                      prerequisites: ['arrays','dp_1d'] },
  { id: 'bit_manipulation',label: 'Bit Manipulation',            icon: '⚡', color: 'hsl(210,100%,52%)', minProblems: 4,  patterns: ['Bit Manipulation'],                              description: 'XOR tricks, counting bits, power of two. Often O(1) space solutions.',                                      prerequisites: ['arrays'] },
  { id: 'math',            label: 'Math & Number Theory',        icon: '🔢', color: 'hsl(262,83%,58%)',  minProblems: 4,  patterns: ['Math'],                                          description: 'GCD, prime sieve, modular arithmetic, fast power.',                                                         prerequisites: ['arrays'] },
];

// ── TUF A-Z Sheet (Striver's A-Z DSA) ────────────────────────────────────────
// Exact step sequence from https://takeuforward.org/strivers-a2z-dsa-course
export const TUF_AZ = [
  { id: 'tuf_basics',        label: 'Step 1 — Basics',                          icon: '🧱', color: 'hsl(210,100%,52%)', minProblems: 6,  step: 1,  patterns: ['Math','Recursion'],                              description: 'Time/space complexity, basic maths (GCD, prime, digits), recursion fundamentals.',                          prerequisites: [] },
  { id: 'tuf_sorting',       label: 'Step 2 — Sorting',                         icon: '🔃', color: 'hsl(142,71%,45%)',  minProblems: 4,  step: 2,  patterns: ['Sorting'],                                       description: 'Bubble, selection, insertion, merge sort, quick sort. Understand why, not just how.',                       prerequisites: ['tuf_basics'] },
  { id: 'tuf_arrays',        label: 'Step 3 — Arrays',                          icon: '📦', color: 'hsl(38,92%,50%)',   minProblems: 12, step: 3,  patterns: ['Arrays','Hashing','Two Pointers'],               description: 'Easy → Medium → Hard. Kadane, Dutch flag, majority element, next permutation.',                             prerequisites: ['tuf_sorting'] },
  { id: 'tuf_binary_search', label: 'Step 4 — Binary Search',                   icon: '🔍', color: 'hsl(262,83%,58%)',  minProblems: 10, step: 4,  patterns: ['Binary Search'],                                 description: '1D & 2D arrays, search space. Koko eating bananas, aggressive cows, book allocation.',                     prerequisites: ['tuf_arrays'] },
  { id: 'tuf_strings',       label: 'Step 5 — Strings',                         icon: '🔤', color: 'hsl(180,60%,45%)',  minProblems: 8,  step: 5,  patterns: ['Strings','Sliding Window'],                      description: 'Basic & medium string problems. Anagram, palindrome, KMP, Z-algorithm.',                                   prerequisites: ['tuf_arrays'] },
  { id: 'tuf_linked_list',   label: 'Step 6 — Linked List',                     icon: '🔗', color: 'hsl(300,60%,50%)',  minProblems: 10, step: 6,  patterns: ['Linked List','Two Pointers'],                    description: 'Singly & doubly LL, medium & hard. Reverse, detect cycle, merge, LRU cache.',                              prerequisites: ['tuf_arrays'] },
  { id: 'tuf_recursion',     label: 'Step 7 — Recursion & Backtracking',        icon: '🔄', color: 'hsl(0,84%,60%)',    minProblems: 10, step: 7,  patterns: ['Recursion','Backtracking'],                      description: 'Get a strong hold, subsequences, hard problems. N-Queens, Sudoku solver, word search.',                    prerequisites: ['tuf_linked_list'] },
  { id: 'tuf_bit',           label: 'Step 8 — Bit Manipulation',                icon: '⚡', color: 'hsl(38,92%,50%)',   minProblems: 6,  step: 8,  patterns: ['Bit Manipulation'],                              description: 'Concepts & interview problems. XOR tricks, set/unset bits, power set using bits.',                          prerequisites: ['tuf_arrays'] },
  { id: 'tuf_stack_queue',   label: 'Step 9 — Stack & Queue',                   icon: '📚', color: 'hsl(210,100%,52%)', minProblems: 10, step: 9,  patterns: ['Stack','Queue'],                                 description: 'Learning, prefix/infix/postfix, monotonic stack. Next greater element, largest rectangle.',                 prerequisites: ['tuf_recursion'] },
  { id: 'tuf_sliding_window',label: 'Step 10 — Sliding Window & Two Pointers',  icon: '🪟', color: 'hsl(142,71%,45%)',  minProblems: 8,  step: 10, patterns: ['Sliding Window','Two Pointers'],                 description: 'Medium & hard. Longest substring without repeat, minimum window substring.',                                prerequisites: ['tuf_strings'] },
  { id: 'tuf_heap',          label: 'Step 11 — Heap',                           icon: '⛰️', color: 'hsl(262,83%,58%)',  minProblems: 8,  step: 11, patterns: ['Heap'],                                          description: 'Learning, medium & hard. Top-K, merge K sorted, median from stream.',                                      prerequisites: ['tuf_stack_queue'] },
  { id: 'tuf_greedy',        label: 'Step 12 — Greedy',                         icon: '💰', color: 'hsl(180,60%,45%)',  minProblems: 8,  step: 12, patterns: ['Greedy'],                                        description: 'Easy & medium/hard greedy. N meetings, jump game, candy, job sequencing.',                                  prerequisites: ['tuf_arrays'] },
  { id: 'tuf_binary_tree',   label: 'Step 13 — Binary Trees',                   icon: '🌳', color: 'hsl(300,60%,50%)',  minProblems: 12, step: 13, patterns: ['Trees','Recursion','BFS','DFS'],                 description: 'Traversals, medium & hard. LCA, max path sum, Morris traversal, serialize.',                                prerequisites: ['tuf_recursion'] },
  { id: 'tuf_bst',           label: 'Step 14 — Binary Search Tree',             icon: '🌲', color: 'hsl(0,84%,60%)',    minProblems: 8,  step: 14, patterns: ['Trees','Binary Search'],                         description: 'Concepts & problems. Inorder successor, LCA in BST, construct BST, recover BST.',                          prerequisites: ['tuf_binary_tree'] },
  { id: 'tuf_graphs',        label: 'Step 15 — Graphs',                         icon: '🕸️', color: 'hsl(38,92%,50%)',   minProblems: 14, step: 15, patterns: ['Graphs','BFS','DFS','Union Find','Topological Sort'], description: 'BFS/DFS, topo sort, Dijkstra, Bellman-Ford, MST (Prim/Kruskal), SCC.',                                  prerequisites: ['tuf_binary_tree'] },
  { id: 'tuf_dp',            label: 'Step 16 — Dynamic Programming',            icon: '🧩', color: 'hsl(210,100%,52%)', minProblems: 16, step: 16, patterns: ['Dynamic Programming'],                           description: '1D, 2D, grids, subsequences, strings, stocks, LIS, partition, MCM, squares.',                              prerequisites: ['tuf_recursion'] },
  { id: 'tuf_trie',          label: 'Step 17 — Trie',                           icon: '🌐', color: 'hsl(142,71%,45%)',  minProblems: 5,  step: 17, patterns: ['Trie'],                                          description: 'Theory & problems. Implement trie, longest common prefix, XOR max pair.',                                  prerequisites: ['tuf_graphs'] },
  { id: 'tuf_intervals',     label: 'Step 18 — Intervals & Advanced',           icon: '📐', color: 'hsl(262,83%,58%)',  minProblems: 6,  step: 18, patterns: ['Intervals','Greedy'],                            description: 'Merge intervals, insert interval, non-overlapping intervals, meeting rooms.',                               prerequisites: ['tuf_greedy'] },
];

// ── Shared progress computation ───────────────────────────────────────────────
export function computeRoadmapProgress(problems, sheet = 'generic') {
  const source = sheet === 'tuf_az' ? TUF_AZ : ROADMAP;
  const solved = problems.filter(p => p.status === 'solved');

  const patternSolvedCount = {};
  solved.forEach(p => {
    (p.tags || []).forEach(tag => {
      patternSolvedCount[tag] = (patternSolvedCount[tag] || 0) + 1;
    });
  });

  const topicSolvedCount = {};
  source.forEach(topic => {
    topicSolvedCount[topic.id] = topic.patterns.reduce(
      (sum, pat) => sum + (patternSolvedCount[pat] || 0), 0
    );
  });

  const completedIds = new Set();
  source.forEach(topic => {
    if (topicSolvedCount[topic.id] >= topic.minProblems) completedIds.add(topic.id);
  });

  return source.map(topic => {
    const solvedCount = topicSolvedCount[topic.id];
    const prereqsMet = topic.prerequisites.every(id => completedIds.has(id));
    const isCompleted = completedIds.has(topic.id);
    const progress = Math.min(100, Math.round((solvedCount / topic.minProblems) * 100));

    let status;
    if (isCompleted) status = 'completed';
    else if (prereqsMet && solvedCount > 0) status = 'active';
    else if (prereqsMet) status = 'unlocked';
    else status = 'locked';

    return { ...topic, solvedCount, progress, status, prereqsMet };
  });
}

export function detectActiveTopic(roadmapProgress) {
  return roadmapProgress.find(t => t.status === 'active' && t.solvedCount > 0)
    || roadmapProgress.find(t => t.status === 'unlocked')
    || null;
}
