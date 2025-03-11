const isUndefined = require('../utils/isUndefined')
const isNotValidSting = require('../utils/isNotValidSting')

const createSkill = {
  name: [isUndefined, isNotValidSting],
}


module.exports = {
  createSkill,
}