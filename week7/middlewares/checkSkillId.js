const isUndefined = require('../utils/isUndefined')
const isNotValidSting = require('../utils/isNotValidSting')
const ApiError = require('../utils/ApiError')

const checkSkillId = (req, res, next) => {
  const { skillId } = req.params

  if (isUndefined(skillId) || isNotValidSting(skillId)) {
    next(new ApiError(400, 'ID錯誤'))
  }
  next()
}

module.exports = checkSkillId