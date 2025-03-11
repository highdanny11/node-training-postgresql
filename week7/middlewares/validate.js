const ApiError = require('../utils/ApiError')
const validate = (schema) => (req, res, next) => {
  const data = req.body
  for (const key in schema) {
    const column = data[key]
    const columnValidate = schema[key]
    columnValidate.forEach((fn) => {
      if (fn(column)) {
        next(new ApiError(400, fn.message))
      }
    })
  }
  next()
}

module.exports = validate;