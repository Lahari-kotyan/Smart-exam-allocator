{
  "name": "Assignment",
  "type": "object",
  "properties": {
    "exam_id": {
      "type": "string",
      "title": "Exam ID"
    },
    "faculty_id": {
      "type": "string",
      "title": "Faculty ID"
    },
    "faculty_name": {
      "type": "string",
      "title": "Faculty Name"
    },
    "department": {
      "type": "string",
      "title": "Department"
    },
    "subject": {
      "type": "string",
      "title": "Subject"
    },
    "date": {
      "type": "string",
      "format": "date",
      "title": "Date"
    },
    "time_slot": {
      "type": "string",
      "title": "Time Slot"
    },
    "start_time": {
      "type": "string",
      "title": "Start Time"
    },
    "end_time": {
      "type": "string",
      "title": "End Time"
    },
    "room_number": {
      "type": "string",
      "title": "Room Number"
    },
    "building": {
      "type": "string",
      "title": "Building"
    },
    "reason": {
      "type": "string",
      "title": "AI Allocation Reason"
    },
    "is_emergency_replacement": {
      "type": "boolean",
      "default": false,
      "title": "Is Emergency Replacement"
    },
    "schedule_batch_id": {
      "type": "string",
      "title": "Schedule Batch ID"
    }
  },
  "required": [
    "exam_id",
    "faculty_id",
    "faculty_name",
    "date",
    "time_slot"
  ]
}
