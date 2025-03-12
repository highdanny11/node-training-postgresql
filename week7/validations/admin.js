const isUndefined = require('../utils/isUndefined')
const isNotValidSting = require('../utils/isNotValidSting')
const isNotValidInteger = require('../utils/isNotValidInteger')

const addCoachCourse = {
  skill_id: [isUndefined, isNotValidInteger],
  name: [isUndefined, isNotValidSting],
  description: [isUndefined, isNotValidSting],
  start_at: [isUndefined, isNotValidSting],
  end_at: [isUndefined, isNotValidSting],
  max_participants: [isUndefined, isNotValidInteger],
  meeting_url: [isUndefined, isNotValidSting]
}

const updateCoachCourses = {
  skill_id: [isUndefined, isNotValidInteger],
  name: [isUndefined, isNotValidSting],
  description: [isUndefined, isNotValidSting],
  start_at: [isUndefined, isNotValidSting],
  end_at: [isUndefined, isNotValidSting],
  max_participants: [isUndefined, isNotValidInteger],
  meeting_url: [isUndefined, isNotValidSting]
}

const createCoach = {
  experience_years: [isUndefined, isNotValidInteger],
  description: [isUndefined, isNotValidSting],
}

const updateCoach = {
  experience_years: [isUndefined, isNotValidInteger],
  description: [isUndefined, isNotValidSting],
  profile_image_url: [isUndefined, isNotValidSting],
  skill_ids: [isUndefined]
}

module.exports = {
  addCoachCourse,
  updateCoachCourses,
  createCoach,
  updateCoach
}