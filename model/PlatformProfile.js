PlatformProfile={
  "name": "PlatformProfile",
  "type": "object",
  "properties": {
    "platform": {
      "type": "string",
      "enum": [
        "leetcode",
        "codeforces",
        "codechef",
        "github",
        "geeksforgeeks",
        "hackerrank"
      ]
    },
    "username": {
      "type": "string"
    },
    "profile_url": {
      "type": "string"
    },
    "problems_solved": {
      "type": "number",
      "default": 0
    },
    "rating": {
      "type": "number"
    },
    "max_rating": {
      "type": "number"
    },
    "contributions": {
      "type": "number",
      "default": 0
    },
    "streak": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "platform",
    "username"
  ]
}