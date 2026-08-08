import { api } from "./client";

// ─── Enum maps — frontend (lowercase) → backend (UPPERCASE) ──────────────────

const PLATFORM_UP = {
  leetcode: "LEETCODE",
  codeforces: "CODEFORCES",
  codechef: "CODECHEF",
  geeksforgeeks: "GEEKSFORGEEKS",
  hackerrank: "HACKERRANK",
  other: "OTHER",
};

const DIFFICULTY_UP = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
};

const STATUS_UP = {
  todo: "TODO",
  solved: "SOLVED",
  attempted: "ATTEMPTED",
  revisit: "REVISIT",
};

const SHEET_UP = {
  none: "NONE",
  blind75: "BLIND75",
  striver_sde: "STRIVER_SDE",
  neetcode150: "NEETCODE150",
  grind75: "GRIND75",
};

// Reverse maps — backend → frontend (for reading responses)
const PLATFORM_DOWN  = Object.fromEntries(Object.entries(PLATFORM_UP).map(([k, v]) => [v, k]));
const DIFFICULTY_DOWN = Object.fromEntries(Object.entries(DIFFICULTY_UP).map(([k, v]) => [v, k]));
const STATUS_DOWN    = Object.fromEntries(Object.entries(STATUS_UP).map(([k, v]) => [v, k]));
const SHEET_DOWN     = Object.fromEntries(Object.entries(SHEET_UP).map(([k, v]) => [v, k]));

// ─── Transform: frontend form shape → Spring Boot request body ────────────────
//
// Key changes:
//   platform/difficulty/status/sheet  → UPPERCASE enums
//   pattern (single string)           → patterns (array)
//   approach (single string)          → approaches (array)
//   time_complexity                   → timeComplexity
//   space_complexity                  → spaceComplexity
//   revision_dates                    → revisionDates
//   solved_date                       → dropped (not in backend schema)

export function toBackend(problem) {
  return {
    title:           problem.title,
    url:             problem.url || "",
    platform:        PLATFORM_UP[problem.platform]   ?? problem.platform?.toUpperCase()   ?? "LEETCODE",
    difficulty:      DIFFICULTY_UP[problem.difficulty] ?? problem.difficulty?.toUpperCase() ?? "MEDIUM",
    status:          STATUS_UP[problem.status]        ?? problem.status?.toUpperCase()      ?? "TODO",
    sheet:           SHEET_UP[problem.sheet]          ?? problem.sheet?.toUpperCase()       ?? "NONE",
    tags:            problem.tags            || [],
    companies:       problem.companies       || [],

    // already arrays from the form
    patterns:        problem.patterns   || [],
    approaches:      problem.approaches || [],

    // snake_case → camelCase
    timeComplexity:  problem.time_complexity  || problem.timeComplexity  || "",
    spaceComplexity: problem.space_complexity || problem.spaceComplexity || "",
    revisionDates:   problem.revision_dates   || problem.revisionDates   || [],

    notes:           problem.notes || "",
  };
}

// ─── Transform: Spring Boot response → frontend shape ─────────────────────────
//
// Pages and components read lowercase fields (difficulty, status, etc.)
// and single-string pattern/approach — keep that contract intact.

export function fromBackend(problem) {
  return {
    id:               problem.id,
    title:            problem.title,
    url:              problem.url || "",
    platform:         PLATFORM_DOWN[problem.platform]   ?? problem.platform?.toLowerCase()   ?? "leetcode",
    difficulty:       DIFFICULTY_DOWN[problem.difficulty] ?? problem.difficulty?.toLowerCase() ?? "medium",
    status:           STATUS_DOWN[problem.status]        ?? problem.status?.toLowerCase()      ?? "todo",
    sheet:            SHEET_DOWN[problem.sheet]          ?? problem.sheet?.toLowerCase()       ?? "none",
    tags:             problem.tags       || [],
    companies:        problem.companies  || [],

    // array stays as array — form reads patterns[] directly
    patterns:         problem.patterns   || [],

    // array stays as array — form reads approaches[] directly  
    approaches:       problem.approaches  || [],

    // camelCase → snake_case
    time_complexity:  problem.timeComplexity  || "",
    space_complexity: problem.spaceComplexity || "",
    revision_dates:   problem.revisionDates   || [],

    notes:            problem.notes || "",
    solved_date:      problem.solvedDate || null,
    created_at:       problem.createdAt  || null,
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export function getProblems() {
  return api("/problems").then(data => data.map(fromBackend));
}

export function createProblem(problem) {
  return api("/problems", {
    method: "POST",
    body: JSON.stringify(toBackend(problem)),
  }).then(fromBackend);
}

export function updateProblem(id, problem) {
  return api(`/problems/${id}`, {
    method: "PUT",
    body: JSON.stringify(toBackend(problem)),
  }).then(fromBackend);
}

export function deleteProblem(id) {
  return api(`/problems/${id}`, {
    method: "DELETE",
  });
}

// Bulk import — used by ImportProblems.jsx
// Accepts the already-merged frontend array, transforms each to backend shape
export function bulkImportProblems(problems) {
  return api("/problems/upsert", {
    method: "POST",
    body: JSON.stringify(problems.map(toBackend)),
  });
}
