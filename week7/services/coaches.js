const { dataSource } = require('../db/data-source')
const ApiError = require('../utils/ApiError')
const { IsNull } = require('typeorm')


const getCoaches = async () => {
  const coaches = await dataSource.getRepository('Coach').find({
    select: {
      id: true,
      experience_years: true,
      description: true,
      profile_image_url: true,
      User: {
        name: true
      }
    },
    relations: {
      User: true
    }
  })
  return coaches.map(coach => ({
    id: coach.id,
    name: coach.User.name,
    experience_years: coach.experience_years,
    description: coach.description,
    profile_image_url: coach.profile_image_url
  }))
}

const getCoachDetail = async (coachId) => {
  const coach = await dataSource.getRepository('Coach').findOne({
    select: {
      id: true,
      user_id: true,
      experience_years: true,
      description: true,
      profile_image_url: true,
      created_at: true,
      updated_at: true,
      User: {
        name: true,
        role: true
      }
    },
    where: {
      id: coachId
    },
    relations: {
      User: true
    }
  })
  if (!coach) {
    throw new ApiError('找不到該教練', 404)
  }
  return {
    user: coach.User,
    coach: {
      id: coach.id,
      user_id: coach.user_id,
      experience_years: coach.experience_years,
      description: coach.description,
      profile_image_url: coach.profile_image_url,
      created_at: coach.created_at,
      updated_at: coach.updated_at
    }
  }
}

const getCoachCourses = async (coachId) => {
  const coach = await dataSource.getRepository('Coach').findOne({
    select: {
      id: true,
      user_id: true,
      User: {
        name: true
      }
    },
    where: {
      id: coachId
    },
    relations: {
      User: true
    }
  })
  if (!coach) throw new ApiError(400, '找不到該教練')
  const courses = await dataSource.getRepository('Course').find({
    select: {
      id: true,
      name: true,
      description: true,
      start_at: true,
      end_at: true,
      max_participants: true,
      Skill: {
        name: true
      }
    },
    where: {
      user_id: coach.user_id
    },
    relations: {
      Skill: true
    }
  })
  return courses.map((course) => ({
    id: course.id,
    name: course.name,
    description: course.description,
    start_at: course.start_at,
    end_at: course.end_at,
    max_participants: course.max_participants,
    coach_name: coach.User.name,
    skill_name: course.Skill.name
  }))
}

module.exports = {
  getCoaches,
  getCoachDetail,
  getCoachCourses
}