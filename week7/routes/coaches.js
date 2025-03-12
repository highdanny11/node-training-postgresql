const express = require('express')

const router = express.Router()
const coaches = require('../controllers/coaches')
const checkCoachId = require('../middlewares/checkCoachId')

router.get('/', coaches.getCoaches)

router.get('/:coachId', checkCoachId, coaches.getCoachDetail)

router.get('/:coachId/courses', checkCoachId, coaches.getCoachCourses)

module.exports = router
