function isNotValidInteger(value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

isNotValidInteger.message = '欄位未填寫正確'

module.exports = isNotValidInteger