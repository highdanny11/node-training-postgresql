const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coaches')
const examNotEmpty = require('../utils/examNotEmpty')
const examNumber = require('../utils/examNumber')
const examString = require('../utils/examString')
const config = require('../config/index')
const auth = require('../middlwares/auth')({
  secret: config.get('secret').jwtSecret,
  repository: dataSource.getRepository('User'),
})
const isCoach = require('../middlwares/isCoach')
const reponse = require('../utils/reponse')
const { P } = require('pino')



router.post('/coaches/courses',  auth, isCoach, async (req, res, next) => {
  console.log(req, 'enter')
  const { id } = req.user
  const {
    user_id: userId, profile_image_url: profileImageUrl,
    name, skill_id: skillId, start_at: startAt, end_at: endAt,
    description, max_participants: maxParticipants, meeting_url: meetingUrl
  } = req.body

  const validDataSchema = {
    user_id: [examNotEmpty, examString],
    profile_image_url: [examNotEmpty, examString],
    name: [examNotEmpty, examString],
    skill_id: [examNotEmpty, examString],
    start_at: [examNotEmpty, examString],
    end_at: [examNotEmpty, examString],
    description: [examNotEmpty, examString],
    max_participants: [examNotEmpty, examNumber],
    meeting_url: [examNotEmpty, examString],
  }

  for (const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      reponse(res, {status: 400})
      return
    }
  }
  try {
    const courseRepository = dataSource.getRepository('Course')
    const newCourse = courseRepository.create({
      user_id: id,
      skill_id: skillId,
      name,
      description,
      start_at: startAt,
      end_at: endAt,
      max_participants: maxParticipants,
      meeting_url: meetingUrl
    })
    const savedCourse = await courseRepository.save(newCourse)
    const course = await courseRepository.findOneBy({
      id: savedCourse.id
    })
    reponse(res, {status: 201, data: { course }})
  } catch (error) {
    logger.error(error)
    next(error)
  }
})
router.put('/coaches/courses/:courseId',  auth, isCoach, async (req, res, next) => {
  const { id } = req.user
  const { courseId } = req.params
  const {
    skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
    max_participants: maxParticipants, meeting_url: meetingUrl
  } = req.body

  const validDataSchema = {
    skill_id: [examNotEmpty, examString],
    name: [examNotEmpty, examString],
    description: [examNotEmpty, examString],
    start_at: [examNotEmpty, examString],
    end_at: [examNotEmpty, examString],
    max_participants: [examNotEmpty, examNumber],
    meeting_url: [examNotEmpty, examString],
  }

  for (const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      reponse(res, {status: 400})
      return
    }
  }
  try {
    const courseRepository = dataSource.getRepository('Course')
    const exitCourse = await courseRepository.findOne({
      where: { id: courseId, user_id: id }
    })
    if (!exitCourse) {
      reponse(res, {status: 400, message: '課程不存在'})
      return
    }
    const updateCourse = await courseRepository.update({
      id: courseId
    }, {
      skill_id: skillId,
      name,
      description,
      start_at: startAt,
      end_at: endAt,
      max_participants: maxParticipants,
      meeting_url: meetingUrl
    })
    if (updateCourse.affected === 0) {
      reponse(res, {status: 400, message: '更新課程失敗'})
      return
    }
    const savedCourse = await courseRepository.findOneBy({
      id: courseId
    })
    reponse(res, {status: 200, data: {course: savedCourse}})
  } catch (error) {
    next(error)
  }

})
router.post('/coaches/:userId', async (req, res, next) => {
  const { userId } = req.params
  const {
    experience_years: experienceYears,
    description,
    profile_image_url: profileImageUrl = null
  } = req.body

  const validDataSchema = {
    experience_years: [examNotEmpty, examNumber],
    description: [examNotEmpty, examString],
    profile_image_url: [examString],
  }

  for (const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      reponse(res, {status: 400})
      return
    }
  }

  try {
    const user = dataSource.getRepository('User')
    const exist = await user.findOne({
      select: ['id', 'name', 'role'],
      where: { id: userId }
    })
    if (!exist) {
      reponse(res, {status: 400, message: '使用者不存在'})
      return
    }
    if (exist.role === 'COACH') {
      reponse(res, {status: 409, message: '使用者已經是教練'})
      return
    }
    const coach = dataSource.getRepository('Coach')
    const newCoach = coach.create({
      user_id: userId,
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl
    })

    const updateUser = await user.update({
      id: userId,
      role: 'USER'
    }, {
      role: 'COACH'
    })
    if (updateUser.affected === 0) {
      reponse(res, {status: 400, message: '更新使用者失敗'})
      return
    }

    const saveCoach = await coach.save(newCoach)
    const saveUser = await user.findOne({
      select: ['name', 'role'],
      where: { id: userId }
    })
    reponse(res, {status: 201, data: {
      user: saveUser,
      coach: saveCoach
    }})
  } catch (error) {
    logger.error(error)
    next(error)
  }

})

module.exports = router