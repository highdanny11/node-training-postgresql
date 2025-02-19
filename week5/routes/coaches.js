const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coaches')
const examNotEmpty = require('../utils/examNotEmpty')
const examNumber = require('../utils/examNumber')
const examString = require('../utils/examString')
const { P } = require('pino')



router.post('/courses', async (req, res, next) => {
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

  for(const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
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
      res.status(400).json({
        status: 'failed',
        message: '使用者不存在'
      })
      return
    }
    if (exist.role !== 'COACH') {
      res.status(400).json({
        status: 'failed',
        message: '使用者尚未成為教練'
      })
      return
    }

    const course = dataSource.getRepository('Course')
    const newCourse = course.create({
      user_id: userId,
      skill_id: skillId,
      name,
      description,
      start_at: startAt,
      end_at: endAt,
      max_participants: maxParticipants,
      meeting_url: meetingUrl
    })
    const save = await course.save(newCourse)
    const saveCourse = await course.findOne({
      where: { id: save.id }
    })
    res.status(201).json({
      status: 'success',
      data: {
        course: saveCourse
      }
    })
  } catch(error) {
    logger.error(error)
    next(error)
  }
})
router.put('/courses/:courseId', async (req, res, next) => {
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

  for(const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
      return
    }
  }
  try {
    const course = dataSource.getRepository('Course')
    const exist = await course.findOne({
      where: { id: courseId }
    })

    if (!exist) {
      res.status(400).json({
        status: 'failed',
        message: '課程不存在'
      })
      return
    }

    const updateCourse = await course.update({
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
      res.status(400).json({
        status: 'failed',
        message: '更新課程失敗'
      })
      return
    }
    const saveCourse = await course.findOne({
      where: { id: courseId }
    })
    res.status(200).json({
      status: 'success',
      data: {
        course: saveCourse
      }
    })
  }catch(error) {

  } 

})
router.post('/:userId', async (req, res, next) => {
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

  for(const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
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
      res.status(400).json({
        status: 'failed',
        message: '使用者不存在'
      })
      return
    }
    if (exist.role === 'COACH') {
      res.status(409).json({
        status: 'failed',
        message: '使用者已經是教練'
      })
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
      res.status(400).json({
        status: 'failed',
        message: '更新使用者失敗'
      })
      return
    }

    const saveCoach = await coach.save(newCoach)
    const saveUser = await user.findOne({
      select: ['name', 'role'],
      where: { id: userId }
    })
    res.status(201).json({
      status: 'success',
      data: {
        user: saveUser,
        coach: saveCoach
      }
    })
  }catch(error) {
    logger.error(error)
    next(error)
  }

})

module.exports = router