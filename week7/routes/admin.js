const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const admin = require('../controllers/admin')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const isCoach = require('../middlewares/isCoach')
const { 
  addCoachCourse, updateCoachCourses,
  createCoach, updateCoach
} = require('../validations/admin')
const checkMonth = require('../middlewares/checkMonth')
const validate = require('../middlewares/validate')

router.post('/coaches/courses', auth, isCoach, validate(addCoachCourse), admin.postCourse)

router.get('/coaches/revenue', auth, isCoach, checkMonth, admin.getCoachRevenue)

router.get('/coaches/courses', auth, isCoach, admin.getCoachCourses)

router.get('/coaches/courses/:courseId', auth, admin.getCoachCourseDetail)

router.put('/coaches/courses/:courseId', auth, validate(updateCoachCourses), admin.putCoachCourseDetail)

router.post('/coaches/:userId', validate(createCoach), admin.postCoach)

router.put('/coaches', auth, isCoach, validate(updateCoach), admin.putCoachProfile)

router.get('/coaches', auth, isCoach, admin.getCoachProfile)

module.exports = router
