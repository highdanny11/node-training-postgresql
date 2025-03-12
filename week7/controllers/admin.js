const logger = require('../utils/logger')('AdminController')
const { adminService } = require('../services')
const ApiError = require('../utils/ApiError')
const isNotValidSting = require('../utils/isNotValidSting')
const isUndefined = require('../utils/isUndefined')
const catchAsync = require('../utils/catchAsync')

const postCourse = catchAsync(async (req, res) => {
  const { id } = req.user
  const {
    skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
    max_participants: maxParticipants, meeting_url: meetingUrl
  } = req.body

  const course = await adminService.createCoachCourse({
    id, skillId, name, description, startAt, endAt, maxParticipants, meetingUrl
  })

  res.status(201).json({
    status: 'success',
    data: {
      course
    }
  })
})

const getCoachRevenue = catchAsync(async (req, res) => {
  const { id } = req.user
  const { month } = req.query
  const courseIds = await adminService.getCoachCoursesIds(id)
  if (courseIds.length === 0) {
    res.status(200).json({
      status: 'success',
      data: {
        total: {
          revenue: 0,
          participants: 0,
          course_count: 0
        }
      }
    })
    return
  }
  const data = await adminService.getCoachRevenue(courseIds, month)
  res.status(200).json({
    status: 'success',
    data: data
  })
})

const getCoachCourses = catchAsync(async (req, res) => {
  const { id } = req.user
  const data = await adminService.getCoachCourses(id)
  res.status(200).json({
    status: 'success',
    data: data
  })
})

const getCoachCourseDetail = catchAsync(async (req, res) => {
  const { id } = req.user
  const data = await adminService.getCoachCourseDetail(id)

  res.status(200).json({
    status: 'success',
    data: data
  })
})

const putCoachCourseDetail = catchAsync(async (req, res) => {
  const { id } = req.user
  const { courseId } = req.params
  const {
    skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
    max_participants: maxParticipants, meeting_url: meetingUrl
  } = req.body

  const course = await adminService.updateCoach({
    id, courseId, skillId, name, description,
    startAt, endAt, maxParticipants, meeting
  })

  res.status(200).json({
    status: 'success',
    data: {
      course: course
    }
  })
})

const postCoach = catchAsync(async (req, res) => {
  const { userId } = req.params
  const {
    experience_years: experienceYears,
    description,
    profile_image_url: profileImageUrl = null } = req.body
  if (profileImageUrl && !isNotValidSting(profileImageUrl) && !profileImageUrl.startsWith('https')) {
    logger.warn('大頭貼網址錯誤')
    throw new ApiError('欄位未填寫正確', 400)
  }
  const data = await adminService.createCoach({
    userId, experienceYears, description, profileImageUrl
  })

  res.status(201).json({
    status: 'success',
    data: data
  })
})

const putCoachProfile = catchAsync(async (req, res) => {
  const { id } = req.user
  const {
    experience_years: experienceYears,
    description,
    profile_image_url: profileImageUrl = null,
    skill_ids: skillIds
  } = req.body
  if (!profileImageUrl.startsWith('https') || !Array.isArray(skillIds)) {
    logger.warn('欄位未填寫正確')
    res.status(400).json({
      status: 'failed',
      message: '欄位未填寫正確'
    })
    return
  }
  if (skillIds.length === 0 || skillIds.every(skill => isUndefined(skill) || isNotValidSting(skill))) {
    logger.warn('欄位未填寫正確')
    res.status(400).json({
      status: 'failed',
      message: '欄位未填寫正確'
    })
    return
  }

  const data = await adminService.updateCoachProfile({
    id, experienceYears, description, profileImageUrl, skillIds
  })
  res.status(200).json({
    status: 'success',
    data: data
  })
})

const getCoachProfile = catchAsync(async (req, res) => {
  const { id } = req.user
  const data = await adminService.getCoachProfile(id)
  res.status(200).json({
    status: 'success',
    data: data
  })
})

module.exports = {
  postCourse,
  getCoachRevenue,
  getCoachCourses,
  getCoachCourseDetail,
  putCoachCourseDetail,
  postCoach,
  putCoachProfile,
  getCoachProfile
}
