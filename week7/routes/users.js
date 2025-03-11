const express = require('express')
const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const users = require('../controllers/users')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const { register, login, updateName, updatePassword } = require('../validations/auth')
const validate = require('../middlewares/validate')
const checkUpdatePassword = require('../middlewares/checkUpdatePassword')

router.post('/signup', validate(register), users.postSignup)
router.post('/login', validate(login), users.postLogin)
router.get('/profile', auth, users.getProfile)
router.get('/credit-package', auth, users.getCreditPackage)
router.put('/profile', auth, validate(updateName), users.putProfile)
router.put('/password', auth, validate(updatePassword), checkUpdatePassword, users.putPassword)
router.get('/courses', auth, users.getCourseBooking)

module.exports = router
