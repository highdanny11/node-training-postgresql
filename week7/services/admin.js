const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

const { dataSource } = require('../db/data-source')
const ApiError = require('../utils/ApiError')

dayjs.extend(utc)

const createCoachCourse = async (form) => {
  const {
    id, skillId, name, description, startAt, endAt, maxParticipants, meetingUrl
  } = form
  const userRepository = dataSource.getRepository('User')
  const existingUser = await userRepository.findOne({
    select: ['id', 'name', 'role'],
    where: { id }
  })
  if (!existingUser) {
    throw new ApiError('使用者不存在', 400)
  }
  const courseRepo = dataSource.getRepository('Course')
  const newCourse = courseRepo.create({
    user_id: id,
    skill_id: skillId,
    name,
    description,
    start_at: startAt,
    end_at: endAt,
    max_participants: maxParticipants,
    meeting_url: meetingUrl
  })
  const savedCourse = await courseRepo.save(newCourse)
  const course = await courseRepo.findOne({
    where: { id: savedCourse.id }
  })

  return course
}

const getCoachCoursesIds = async (userId) => {
  const courseRepo = dataSource.getRepository('Course')
  const courses = await courseRepo.find({
    where: { user_id: userId }
  })
  const courseIds = courses.map(course => course.id)
  return courseIds
}

const getCoachRevenue = async (courseIds, month) => {
  const courseBookingRepo = dataSource.getRepository('CourseBooking')
  const year = new Date().getFullYear()
  const calculateStartAt = dayjs(`${year}-${month}-01`).startOf('month').toISOString()
  const calculateEndAt = dayjs(`${year}-${month}-01`).endOf('month').toISOString()
  const courseCount = await courseBookingRepo.createQueryBuilder('course_booking')
    .select('COUNT(*)', 'count')
    .where('course_id IN (:...ids)', { ids: courseIds })
    .andWhere('cancelled_at IS NULL')
    .andWhere('created_at >= :startDate', { startDate: calculateStartAt })
    .andWhere('created_at <= :endDate', { endDate: calculateEndAt })
    .getRawOne()
  const participants = await courseBookingRepo.createQueryBuilder('course_booking')
    .select('COUNT(DISTINCT(user_id))', 'count')
    .where('course_id IN (:...ids)', { ids: courseIds })
    .andWhere('cancelled_at IS NULL')
    .andWhere('created_at >= :startDate', { startDate: calculateStartAt })
    .andWhere('created_at <= :endDate', { endDate: calculateEndAt })
    .getRawOne()
  const totalCreditPackage = await dataSource.getRepository('CreditPackage').createQueryBuilder('credit_package')
    .select('SUM(credit_amount)', 'total_credit_amount')
    .addSelect('SUM(price)', 'total_price')
    .getRawOne()
  const perCreditPrice = totalCreditPackage.total_price / totalCreditPackage.total_credit_amount
  const totalRevenue = courseCount.count * perCreditPrice

  return {
    total: {
      revenue: Math.floor(totalRevenue),
      participants: parseInt(participants.count, 10),
      course_count: parseInt(courseCount.count, 10)
    }
  }
}

const getCoachCourses = async (userId) => {
  const courses = await dataSource.getRepository('Course').find({
    select: {
      id: true,
      name: true,
      start_at: true,
      end_at: true,
      max_participants: true
    },
    where: {
      user_id: userId
    }
  })
  const courseIds = courses.map((course) => course.id)
  const coursesParticipant = await dataSource.getRepository('CourseBooking')
    .createQueryBuilder('course_booking')
    .select('course_id')
    .addSelect('COUNT(course_id)', 'count')
    .where('course_id IN (:...courseIds)', { courseIds })
    .andWhere('cancelled_at is null')
    .groupBy('course_id')
    .getRawMany()
  const now = new Date()

  return courses.map((course) => {
    const startAt = new Date(course.start_at)
    const endAt = new Date(course.end_at)
    let status = '尚未開始'
    if (startAt < now) {
      status = '進行中'
      if (endAt < now) {
        status = '已結束'
      }
    }
    const courseParticipant = coursesParticipant.find((courseParticipant) => courseParticipant.course_id === course.id)
    return {
      id: course.id,
      name: course.name,
      status,
      start_at: course.start_at,
      end_at: course.end_at,
      max_participants: course.max_participants,
      participants: courseParticipant ? courseParticipant.count : 0
    }
  })
}

const getCoachCourseDetail = async (courseId) => {
  const course = await dataSource.getRepository('Course').findOne({
    select: {
      id: true,
      name: true,
      description: true,
      start_at: true,
      end_at: true,
      max_participants: true,
      meeting_url: true,
      Skill: {
        name: true
      }
    },
    where: {
      user_id: courseId
    },
    relations: {
      Skill: true
    }
  })
  return {
    id: course.id,
    name: course.name,
    description: course.description,
    start_at: course.start_at,
    end_at: course.end_at,
    max_participants: course.max_participants,
    skill_name: course.Skill.name,
    meeting_url: course.meeting_url,
  }
}

const updateCoach = async (form) => {
  const {
    id, courseId, skillId, name, description,
    startAt, endAt, maxParticipants, meetingUrl
  } = form
  const courseRepo = dataSource.getRepository('Course')
  const existingCourse = await courseRepo.findOne({
    where: { id: courseId, user_id: id }
  })
  if (!existingCourse) {
    throw new ApiError('課程不存在', 400)
  }
  const updatedCourse = await courseRepo.update({
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

  if (updatedCourse.affected === 0) {
    throw new ApiError('更新課程失敗', 400)
  }
  const savedCourse = await courseRepo.findOne({
    where: { id: courseId }
  })

  return {
    course: savedCourse
  }
}

const createCoach = async (form) => {
  const {
    userId, experienceYears, description, profileImageUrl = null
  } = form
  const userRepository = dataSource.getRepository('User')
  const existingUser = await userRepository.findOne({
    select: ['id', 'name', 'role'],
    where: { id: userId }
  })
  if (!existingUser) {
    throw new ApiError('使用者不存在', 400)
  }
  if (existingUser.role !== 'coach') {
    throw new ApiError('使用者不是教練', 400)
  }

  const coachRepo = dataSource.getRepository('Coach')
  const newCoach = coachRepo.create({
    user_id: userId,
    experience_years: experienceYears,
    description,
    profile_image_url: profileImageUrl
  })
  const updatedUser = await userRepository.update({
    id: userId,
    role: 'USER'
  }, {
    role: 'COACH'
  })

  if (updatedUser.affected === 0) {
    throw new ApiError('更新使用者失敗', 400)
  }

  const savedCoach = await coachRepo.save(newCoach)
  const savedUser = await userRepository.findOne({
    select: ['name', 'role'],
    where: { id: userId }
  })

  return {
    user: savedUser,
    coach: savedCoach,
  }
}

const updateCoachProfile = async (form) => {
  const { 
    id, experienceYears, description, profileImageUrl, skillIds
  } = form
  
  const coachRepo = dataSource.getRepository('Coach')
  const coach = await coachRepo.findOne({
    select: ['id'],
    where: { user_id: id }
  })
  await coachRepo.update({
    id: coach.id
  }, {
    experience_years: experienceYears,
    description,
    profile_image_url: profileImageUrl
  })
  const coachLinkSkillRepo = dataSource.getRepository('CoachLinkSkill')
  const newCoachLinkSkill = skillIds.map(skill => ({
    coach_id: coach.id,
    skill_id: skill
  }))
  await coachLinkSkillRepo.delete({ coach_id: coach.id })
  await coachLinkSkillRepo.insert(newCoachLinkSkill)
  const result = await coachRepo.find({
    select: {
      id: true,
      experience_years: true,
      description: true,
      profile_image_url: true,
      CoachLinkSkill: {
        skill_id: true
      }
    },
    where: { id: coach.id },
    relations: {
      CoachLinkSkill: true
    }
  })

  return {
    id: result[0].id,
    experience_years: result[0].experience_years,
    description: result[0].description,
    profile_image_url: result[0].profile_image_url,
    skill_ids: result[0].CoachLinkSkill.map(skill => skill.skill_id)
  }
}

const getCoachProfile = async (userId) => {
  const coachRepo = dataSource.getRepository('Coach')
  const coach = await coachRepo.findOne({
    select: ['id'],
    where: { user_id: userId }
  })
  const result = await dataSource.getRepository('Coach').findOne({
    select: {
      id: true,
      experience_years: true,
      description: true,
      profile_image_url: true,
      CoachLinkSkill: {
        skill_id: true
      }
    },
    where: { id: coach.id },
    relations: {
      CoachLinkSkill: true
    }
  })

  return {
    id: result.id,
    experience_years: result.experience_years,
    description: result.description,
    profile_image_url: result.profile_image_url,
    skill_ids: result.CoachLinkSkill.length > 0 ? result.CoachLinkSkill.map(skill => skill.skill_id) : result.CoachLinkSkill
  }
}

module.exports = {
  createCoachCourse,
  getCoachCoursesIds,
  getCoachRevenue,
  getCoachCourses,
  getCoachCourseDetail,
  updateCoach,
  createCoach,
  updateCoachProfile,
  getCoachProfile
}