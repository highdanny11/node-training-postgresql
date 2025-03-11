const isUndefined = require('../utils/isUndefined')
const isNotValidSting = require('../utils/isNotValidSting')
const isNotPasswordRule = require('../utils/isNotPasswordRule')


const register = {
  name: [isUndefined, isNotValidSting],
  email: [isUndefined, isNotValidSting],
  password: [isUndefined, isNotValidSting, isNotPasswordRule],
}

const login = {
  email: [isUndefined, isNotValidSting],
  password: [isUndefined, isNotValidSting, isNotPasswordRule],
}

const updateName = {
  name: [isUndefined, isNotValidSting],
}

const updatePassword = {
  password: [isUndefined, isNotValidSting, isNotPasswordRule],
  new_password: [isUndefined, isNotValidSting, isNotPasswordRule],
  confirm_new_password: [isUndefined, isNotValidSting, isNotPasswordRule],
}

module.exports = {
  register,
  login,
  updateName,
  updatePassword
}