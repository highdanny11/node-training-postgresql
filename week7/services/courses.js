const { dataSource } = require('../db/data-source')
const ApiError = require('../utils/ApiError')
const { IsNull } = require('typeorm')


const getAllCourses = async () => {
  const courses = await dataSource.getRepository('Course').find({
    select: {
      id: true,
      name: true,
      description: true,
      start_at: true,
      end_at: true,
      max_participants: true,
      User: {
        name: true
      },
      Skill: {
        name: true
      }
    },
    relations: {
      User: true,
      Skill: true
    }
  })
  return courses.map((course) => {
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      start_at: course.start_at,
      end_at: course.end_at,
      max_participants: course.max_participants,
      coach_name: course.User.name,
      skill_name: course.Skill.name
    }
  })
}

const bookingCourse = async (userId, courseId) => {
  const courseRepo = dataSource.getRepository('Course')
  const course = await courseRepo.findOne({
    where: {
      id: courseId
    }
  })
  if (!course) throw new ApiError(400, 'ID錯誤')
  const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
  const courseBookingRepo = dataSource.getRepository('CourseBooking')
  const userCourseBooking = await courseBookingRepo.findOne({
    where: {
      user_id: userId,
      course_id: courseId
    }
  })
  if (userCourseBooking) throw new ApiError(400, '已經報名過此課程')
  const userCredit = await creditPurchaseRepo.sum('purchased_credits', {
    user_id: userId
  })
  const userUsedCredit = await courseBookingRepo.count({
    where: {
      user_id: userId,
      cancelledAt: IsNull()
    }
  })
  const courseBookingCount = await courseBookingRepo.count({
    where: {
      course_id: courseId,
      cancelledAt: IsNull()
    }
  })
  if (userUsedCredit >= userCredit) {
    throw new ApiError(400, '已無可使用堂數')
  } else if (courseBookingCount >= course.max_participants) {
    throw new ApiError(400, '已達最大參加人數，無法參加')
  }
  const newCourseBooking = await courseBookingRepo.create({
    user_id: userId,
    course_id: courseId
  })
  await courseBookingRepo.save(newCourseBooking)
}

const deleteCourseBooking = async (userId, courseId) => {
  const courseBookingRepo = dataSource.getRepository('CourseBooking')
  const userCourseBooking = await courseBookingRepo.findOne({
    where: {
      user_id: userId,
      course_id: courseId,
      cancelledAt: IsNull()
    }
  })
  if (!userCourseBooking) throw new ApiError(400, 'ID錯誤')
  const updateResult = await courseBookingRepo.update(
    {
      user_id: userId,
      course_id: courseId,
      cancelledAt: IsNull()
    },
    {
      cancelledAt: new Date().toISOString()
    }
  )
  if (updateResult.affected === 0) throw new ApiError(400, '取消失敗')
}

module.exports = {
  getAllCourses,
  bookingCourse,
  deleteCourseBooking
}