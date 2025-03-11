const config = require('../config/index')
const logger = require('../utils/logger')('UsersController')
const generateJWT = require('../utils/generateJWT')
const catchAsync = require('../utils/catchAsync')
const { userService } = require('../services');

const postSignup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body
  const userRepository = await userService.checkRepeatEmial(email)
  const savedUser = await userService.createUser({
    name, email, password
  }, userRepository)
  logger.info('新建立的使用者ID:', savedUser.id)
  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: savedUser.id,
        name: savedUser.name
      }
    }
  })
})

const postLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  const existingUser = await userService.checkLoginUser({ email, password })
  logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)

  const token = await generateJWT({
    id: existingUser.id,
    role: existingUser.role
  }, config.get('secret.jwtSecret'), {
    expiresIn: `${config.get('secret.jwtExpiresDay')}`
  })

  res.status(201).json({
    status: 'success',
    data: {
      token,
      user: {
        name: existingUser.name
      }
    }
  })
})

const getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const { name, email } = await userService.getUserProfile(id)
  res.status(200).json({
    status: 'success',
    data: {
      user: { name, email }
    }
  })
})

const getCreditPackage = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const creditPurchase = await userService.getUserCreditPackage(id)
  res.status(200).json({
    status: 'success',
    data: creditPurchase.map((item) => {
      return {
        name: item.CreditPackage.name,
        purchased_credits: item.purchased_credits,
        price_paid: parseInt(item.price_paid, 10),
        purchase_at: item.purchaseAt
      }
    })
  })
})

const putProfile = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const { name } = req.body
  const result = await userService.updateUserProfile({ id, name })
  res.status(200).json({
    status: 'success',
    data: {
      user: result.name
    }
  })
})

const putPassword = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const { password, new_password: newPassword } = req.body

  await userService.updateUserPassword({ id, password, newPassword })
  res.status(200).json({
    status: 'success',
    data: null
  })
})

const getCourseBooking = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const data = await userService.getUserCourseBooking(id)
  res.status(200).json({
    status: 'success',
    data: data
  })
})


module.exports = {
  postSignup,
  postLogin,
  getProfile,
  getCreditPackage,
  putProfile,
  putPassword,
  getCourseBooking
}
