const isUndefined = require('../utils/isUndefined')
const ApiError = require('../utils/ApiError')

const monthMap = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
}


const checkMonth = (req, res, next) => {
  const { month } = req.query

  if (isUndefined(month) || !Object.prototype.hasOwnProperty.call(monthMap, month)) {
    next(new ApiError(400, '欄位未填寫正確'))
  }
  next()
}

module.exports = checkMonth