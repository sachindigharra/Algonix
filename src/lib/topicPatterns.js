/**
 * Topic → Pattern mapping.
 *
 * Topics are DSA concepts (what you study).
 * Patterns are solving techniques within a topic (how you solve).
 *
 * A problem is tagged with a Topic. The Pattern is the specific
 * approach used — this is what builds transferable problem-solving skill.
 */

export const TOPIC_PATTERN_MAP = {
  'Arrays': [
    'Prefix Sum',
    'Suffix Sum',
    'Kadane\'s Algorithm',
    'Dutch National Flag',
    'Moore\'s Voting Algorithm',
    'Next Permutation',
    'Rearrangement',
    'In-place Modification',
    'Frequency Count',
  ],
  'Hashing': [
    'Frequency Map',
    'Two Sum Pattern',
    'Subarray with Given Sum',
    'Longest Subarray',
    'Group Anagrams',
    'Count Distinct',
  ],
  'Sorting': [
    'Merge Sort',
    'Quick Sort',
    'Counting Sort',
    'Cyclic Sort',
    'Custom Comparator',
    'Inversion Count',
  ],
  'Binary Search': [
    'Lower Bound & Upper Bound',
    'Find First / Last Occurrence',
    'Search in Rotated Array',
    'Binary Search on Answer',
    'Peak Element',
    'Median of Two Sorted Arrays',
    'Kth Element',
    'Minimize / Maximize (BS on Answer)',
  ],
  'Two Pointers': [
    'Opposite Ends',
    'Fast & Slow Pointers',
    'Merge Two Sorted Arrays',
    'Three Sum / Four Sum',
    'Container With Most Water',
    'Trapping Rain Water',
  ],
  'Sliding Window': [
    'Fixed Size Window',
    'Variable Size Window',
    'Longest Substring Without Repeat',
    'Minimum Window Substring',
    'At Most K Distinct',
    'Subarray Product Less Than K',
  ],
  'Strings': [
    'KMP Algorithm',
    'Z-Algorithm',
    'Rabin-Karp',
    'Palindrome Check',
    'Anagram / Permutation',
    'String Hashing',
    'Longest Common Prefix',
    'Parenthesis Matching',
  ],
  'Linked List': [
    'Reversal',
    'Fast & Slow Pointers',
    'Merge Two Lists',
    'Cycle Detection',
    'Find Middle',
    'Reorder List',
    'LRU Cache',
    'Clone with Random Pointer',
  ],
  'Stack': [
    'Monotonic Stack',
    'Next Greater Element',
    'Largest Rectangle in Histogram',
    'Valid Parentheses',
    'Prefix / Infix / Postfix',
    'Min Stack',
    'Celebrity Problem',
  ],
  'Queue': [
    'Sliding Window Maximum',
    'BFS using Queue',
    'Circular Queue',
    'Deque Pattern',
    'First Non-Repeating Character',
  ],
  'Recursion': [
    'Subsets / Power Set',
    'Permutations',
    'Combinations',
    'Divide & Conquer',
    'Tower of Hanoi',
    'Josephus Problem',
  ],
  'Backtracking': [
    'N-Queens',
    'Sudoku Solver',
    'Word Search',
    'Rat in a Maze',
    'Combination Sum',
    'Palindrome Partitioning',
    'M-Coloring Problem',
  ],
  'Trees': [
    'Inorder / Preorder / Postorder',
    'Level Order (BFS)',
    'Height & Diameter',
    'LCA (Lowest Common Ancestor)',
    'Path Sum',
    'Serialize & Deserialize',
    'Morris Traversal',
    'Vertical Order Traversal',
    'Boundary Traversal',
  ],
  'Binary Search Tree': [
    'Search / Insert / Delete',
    'Inorder Successor / Predecessor',
    'LCA in BST',
    'Kth Smallest / Largest',
    'Construct BST',
    'Recover BST',
    'BST to Sorted DLL',
  ],
  'Heap': [
    'Top-K Elements',
    'Kth Largest / Smallest',
    'Merge K Sorted Lists',
    'Median from Stream',
    'Task Scheduler',
    'Sliding Window Median',
  ],
  'Graphs': [
    'BFS',
    'DFS',
    'Cycle Detection (Directed)',
    'Cycle Detection (Undirected)',
    'Topological Sort (DFS)',
    'Topological Sort (Kahn\'s BFS)',
    'Bipartite Check',
    'Shortest Path (Dijkstra)',
    'Shortest Path (Bellman-Ford)',
    'Shortest Path (Floyd-Warshall)',
    'MST (Prim\'s)',
    'MST (Kruskal\'s)',
    'Strongly Connected Components',
    'Bridges & Articulation Points',
    'Multi-source BFS',
    'Word Ladder',
  ],
  'Union Find': [
    'Path Compression',
    'Union by Rank',
    'Number of Connected Components',
    'Redundant Connection',
    'Accounts Merge',
  ],
  'Trie': [
    'Insert & Search',
    'Prefix Search',
    'Word Dictionary',
    'XOR Maximum Pair',
    'Count Words with Prefix',
  ],
  'Dynamic Programming': [
    '1D DP (Fibonacci Style)',
    'House Robber Pattern',
    'Coin Change',
    'Knapsack (0/1)',
    'Unbounded Knapsack',
    'Longest Common Subsequence',
    'Longest Increasing Subsequence',
    'Edit Distance',
    'Matrix Chain Multiplication',
    'DP on Grids',
    'DP on Strings',
    'DP on Stocks',
    'DP on Partitions',
    'Digit DP',
    'Bitmask DP',
  ],
  'Greedy': [
    'Activity Selection',
    'Job Sequencing',
    'Fractional Knapsack',
    'Jump Game',
    'Gas Station',
    'Candy Distribution',
    'Interval Scheduling',
    'Huffman Encoding',
  ],
  'Bit Manipulation': [
    'XOR Tricks',
    'Count Set Bits',
    'Power of Two',
    'Subset using Bitmask',
    'Single Number',
    'Reverse Bits',
  ],
  'Math': [
    'GCD / LCM',
    'Sieve of Eratosthenes',
    'Modular Arithmetic',
    'Fast Exponentiation',
    'Number of Digits',
    'Armstrong / Perfect Number',
    'Catalan Number',
  ],
  'Intervals': [
    'Merge Intervals',
    'Insert Interval',
    'Non-overlapping Intervals',
    'Meeting Rooms',
    'Minimum Platforms',
  ],
  'Matrix': [
    'Spiral Order',
    'Rotate Matrix',
    'Set Matrix Zeroes',
    'Search in 2D Matrix',
    'Pascal\'s Triangle',
  ],
  'Sliding Window': [
    'Fixed Size Window',
    'Variable Size Window',
    'Longest Substring Without Repeat',
    'Minimum Window Substring',
    'At Most K Distinct',
  ],
};

// All unique topics (for the Topic filter)
export const ALL_TOPICS = Object.keys(TOPIC_PATTERN_MAP).sort();

// All unique patterns (for the Pattern filter)
export const ALL_PATTERNS = [
  ...new Set(Object.values(TOPIC_PATTERN_MAP).flat()),
].sort();

/**
 * Given a list of selected topics, return the patterns available under them.
 * If no topics selected, return all patterns.
 */
export function getPatternsForTopics(selectedTopics) {
  if (!selectedTopics || selectedTopics.length === 0) return ALL_PATTERNS;
  const patterns = new Set();
  selectedTopics.forEach(topic => {
    (TOPIC_PATTERN_MAP[topic] || []).forEach(p => patterns.add(p));
  });
  return Array.from(patterns).sort();
}
