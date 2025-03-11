function isNotValidSting(value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}
isNotValidSting.message = '欄位未填寫正確'

module.exports = isNotValidSting