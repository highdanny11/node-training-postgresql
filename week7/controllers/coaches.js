const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CoachesController')
const catchAsync = require('../utils/catchAsync')
const { coachService } = require('../services')

const getCoaches = catchAsync(async (req, res, next) => {
  const data = await coachService.getCoaches()
  res.status(200).json({
    status: 'success',
    data
  })
})


const getCoachDetail = catchAsync(async (req, res, next) => {
  const data = await coachService.getCoachDetail(req.params.coachId)
  res.status(200).json({
    status: 'success',
    data
  })
})

const getCoachCourses = catchAsync(async (req, res, next) => {
  const data = await coachService.getCoachCourses(req.params.coachId)
  res.status(200).json({
    status: 'success',
    data
  })
})

module.exports = {
  getCoaches,
  getCoachDetail,
  getCoachCourses
}
