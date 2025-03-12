const isUndefined = require('../utils/isUndefined')
const isNotValidSting = require('../utils/isNotValidSting')
const ApiError = require('../utils/ApiError')

const checkCoachId = (req, res, next) => {
  const { coachId } = req.params
  console.log(coachId)

  if (isUndefined(coachId) || isNotValidSting(coachId)) {
    next(new ApiError(400, '欄位未填寫正確'))
  }
  next()
}

module.exports = checkCoachId