const logger = require('../utils/logger')('CoursesController')
const { courseService } = require('../services');
const catchAsync = require('../utils/catchAsync')


const getAllCourses = catchAsync(async (req, res, next) => {
  const courses = await courseService.getAllCourses()
  res.status(200).json({
    status: 'success',
    data: courses
  })
})

const postCourseBooking = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const { courseId } = req.params
  await courseService.bookingCourse(id, courseId)
  res.status(201).json({
    status: 'success',
    data: null
  })
})

const deleteCourseBooking = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const { courseId } = req.params
  await courseService.deleteCourseBooking(id, courseId)
  res.status(200).json({
    status: 'success',
    data: null
  })
})


module.exports = {
  getAllCourses,
  postCourseBooking,
  deleteCourseBooking
}
