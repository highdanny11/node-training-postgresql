const ApiError = require('../utils/ApiError')
const checkUpdatePassword = (req, res, next) => {
  const { password, new_password: newPassword, confirm_new_password: confirmNewPassword } = req.body

  if (newPassword === password) {
    next(new ApiError(400, '新密碼不能與舊密碼相同'))
  }
  if (newPassword !== confirmNewPassword) {
    next(new ApiError(400, '新密碼與驗證新密碼不一致'))
  }
  next()
}

module.exports = checkUpdatePassword;