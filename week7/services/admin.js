const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

const { dataSource } = require('../db/data-source')
const ApiError = require('../utils/ApiError')

dayjs.extend(utc)
const monthMap = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
}

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

module.exports = {
	createCoachCourse
}