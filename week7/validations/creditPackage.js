const isUndefined = require('../utils/isUndefined')
const isNotValidSting = require('../utils/isNotValidSting')
const isNotValidInteger = require('../utils/isNotValidInteger')


const createCreditPackage = {
  name: [isUndefined, isNotValidSting],
  credit_amount: [isUndefined, isNotValidInteger],
  price: [isUndefined, isNotValidInteger],
}

module.exports = {
  createCreditPackage,
}