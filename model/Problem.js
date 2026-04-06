Problem={
  "name": "Problem",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Problem title"
    },
    "platform": {
      "type": "string",
      "enum": [
        "leetcode",
        "codeforces",
        "codechef",
        "geeksforgeeks",
        "hackerrank",
        "other"
      ],
      "description": "Platform where the problem was solved"
    },
    "difficulty": {
      "type": "string",
      "enum": [
        "easy",
        "medium",
        "hard"
      ],
      "description": "Problem difficulty"
    },
    "status": {
      "type": "string",
      "enum": [
        "solved",
        "attempted",
        "todo",
        "revisit"
      ],
      "default": "todo"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "DSA topics like arrays, dp, graphs etc"
    },
    "companies": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Companies that asked this problem"
    },
    "notes": {
      "type": "string",
      "description": "Personal notes and approach"
    },
    "approach": {
      "type": "string",
      "description": "Solution approach explanation"
    },
    "time_complexity": {
      "type": "string",
      "description": "Time complexity of the solution"
    },
    "space_complexity": {
      "type": "string",
      "description": "Space complexity of the solution"
    },
    "url": {
      "type": "string",
      "description": "Problem URL"
    },
    "sheet": {
      "type": "string",
      "enum": [
        "blind75",
        "striver_sde",
        "neetcode150",
        "grind75",
        "none"
      ],
      "default": "none",
      "description": "Which problem sheet this belongs to"
    },
    "solved_date": {
      "type": "string",
      "format": "date",
      "description": "Date when the problem was solved"
    },
    "revision_dates": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Scheduled revision dates"
    }
  },
  "required": [
    "title",
    "platform",
    "difficulty"
  ]
}