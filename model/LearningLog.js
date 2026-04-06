LearningLog={
  "name": "LearningLog",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date",
      "description": "Date of learning"
    },
    "content": {
      "type": "string",
      "description": "What did you learn today?"
    },
    "topics": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Topics covered"
    },
    "revision_status": {
      "type": "string",
      "enum": [
        "pending",
        "revised",
        "skipped"
      ],
      "default": "pending"
    },
    "next_revision_date": {
      "type": "string",
      "format": "date"
    }
  },
  "required": [
    "date",
    "content"
  ]
}