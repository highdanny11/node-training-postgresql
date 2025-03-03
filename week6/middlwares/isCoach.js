const generatorError = require('../utils/generatorError')

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'COACH') {
    next(generatorError(401, '使用者尚未成為教練'))
    return
  }
  next()
}