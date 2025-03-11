const { dataSource } = require('../db/data-source')
const bcrypt = require('bcrypt')
const ApiError = require('../utils/ApiError')
const { IsNull, In } = require('typeorm')

const checkRepeatEmial = async (email) => {
  const userRepository = dataSource.getRepository('User')
  const existingUser = await userRepository.findOne({
    where: { email }
  })
  if (existingUser) {
    throw new ApiError(409, 'Email 已被使用')
  }
  return userRepository
}

const createUser = async (user = { name: '', email: '', password: '' }, repository = null) => {
  const userRepository = repository || dataSource.getRepository('User')
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(user.password, salt)
  const newUser = userRepository.create({
    ...user,
    role: 'USER',
    password: hashPassword
  })
  const savedUser = await userRepository.save(newUser)
  return savedUser
}

const checkLoginUser = async (user = { email: '', password: '' }) => {
  const { email, password } = user
  const userRepository = dataSource.getRepository('User')
  const existingUser = await userRepository.findOne({
    select: ['id', 'name', 'password', 'role'],
    where: { email }
  })
  if (!existingUser) throw new ApiError(400, '使用者不存在或密碼輸入錯誤')

  const isMatch = await bcrypt.compare(password, existingUser.password)
  if (!isMatch) throw new ApiError(400, '使用者不存在或密碼輸入錯誤')

  return existingUser
}

const getUserProfile = async (id) => {
  const userRepository = dataSource.getRepository('User')
  const user = await userRepository.findOneBy({ id })
  return user
}

const getUserCreditPackage = async (id) => {
  const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
  const creditPurchase = await creditPurchaseRepo.find({
    select: {
      purchased_credits: true,
      price_paid: true,
      purchaseAt: true,
      CreditPackage: {
        name: true
      }
    },
    where: {
      user_id: id
    },
    relations: {
      CreditPackage: true
    }
  })
  return creditPurchase
}

const updateUserProfile = async (newUser = { id: '', name: '' }) => {
  const { name, id } = newUser;
  const userRepository = dataSource.getRepository('User')
  const user = await userRepository.findOne({
    select: ['name'],
    where: { id }
  })
  if (user.name === name) throw new ApiError(400, '使用者名稱未變更')

  const updatedResult = await userRepository.update({
    id,
    name: user.name
  }, {
    name
  })
  if (updatedResult.affected === 0) throw new ApiError(400, '更新使用者資料失敗')

  const result = await userRepository.findOneBy({ id })
  return result
}

const updateUserPassword = async (user = { id: '', password: '', newPassword: '' }) => {
  const { id, password, newPassword } = user
  const userRepository = dataSource.getRepository('User')
  const existingUser = await userRepository.findOne({
    select: ['password'],
    where: { id }
  })

  const isMatch = await bcrypt.compare(password, existingUser.password)
  if (!isMatch) throw new ApiError(400, 密碼輸入錯誤)

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(newPassword, salt)
  const updatedResult = await userRepository.update({
    id
  }, {
    password: hashPassword
  })

  if (updatedResult.affected === 0) throw new ApiError(400, '更新密碼失敗')
}

const getUserCourseBooking = async (id) => {
  const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
  const courseBookingRepo = dataSource.getRepository('CourseBooking')
  const userCredit = await creditPurchaseRepo.sum('purchased_credits', {
    user_id: id
  })
  const userUsedCredit = await courseBookingRepo.count({
    where: {
      user_id: id,
      cancelledAt: IsNull()
    }
  })
  const courseBookingList = await courseBookingRepo.find({
    select: {
      course_id: true,
      Course: {
        name: true,
        start_at: true,
        end_at: true,
        meeting_url: true,
        user_id: true
      }
    },
    where: {
      user_id: id
    },
    order: {
      Course: {
        start_at: 'ASC'
      }
    },
    relations: {
      Course: true
    }
  })

  const coachUserIdMap = {}
  if (courseBookingList.length > 0) {
    courseBookingList.forEach((courseBooking) => {
      coachUserIdMap[courseBooking.Course.user_id] = courseBooking.Course.user_id
    })
    const userRepo = dataSource.getRepository('User')
    const coachUsers = await userRepo.find({
      select: ['id', 'name'],
      where: {
        id: In(Object.values(coachUserIdMap))
      }
    })
    coachUsers.forEach((user) => {
      coachUserIdMap[user.id] = user.name
    })
  }
  return {
    credit_remain: userCredit - userUsedCredit,
    credit_usage: userUsedCredit,
    course_booking: courseBookingList.map((courseBooking) => {
      return {
        course_id: courseBooking.course_id,
        name: courseBooking.Course.name,
        start_at: courseBooking.Course.start_at,
        end_at: courseBooking.Course.end_at,
        meeting_url: courseBooking.Course.meeting_url,
        coach_name: coachUserIdMap[courseBooking.Course.user_id]
      }
    })
  }
}

module.exports = {
  checkRepeatEmial,
  createUser,
  checkLoginUser,
  getUserProfile,
  getUserCreditPackage,
  updateUserProfile,
  updateUserPassword,
  getUserCourseBooking,
}