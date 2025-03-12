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

module.exports = {
  addCoachCourse
}