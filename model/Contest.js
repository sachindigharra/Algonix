Contest={
  "name": "Contest",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Contest name"
    },
    "platform": {
      "type": "string",
      "enum": [
        "leetcode",
        "codeforces",
        "codechef",
        "atcoder",
        "other"
      ]
    },
    "start_time": {
      "type": "string",
      "format": "date-time",
      "description": "Contest start time"
    },
    "duration_minutes": {
      "type": "number",
      "description": "Duration in minutes"
    },
    "url": {
      "type": "string",
      "description": "Contest URL"
    },
    "participated": {
      "type": "boolean",
      "default": false
    },
    "rank": {
      "type": "number",
      "description": "Your rank in the contest"
    },
    "problems_solved": {
      "type": "number",
      "description": "Number of problems solved"
    },
    "rating_change": {
      "type": "number",
      "description": "Rating change after contest"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "platform"
  ]
}