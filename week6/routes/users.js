const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const bcrypt = require('bcrypt')
const logger = require('../utils/logger')('Users')
const examNotEmpty = require('../utils/examNotEmpty')
const examString = require('../utils/examString')
const config = require('../config/index')
const generateJWT = require('../utils/generateJWT')
const reponse = require('../utils/reponse')
const auth = require('../middlwares/auth')({
  secret: config.get('secret').jwtSecret,
  repository: dataSource.getRepository('User'),
})

const saltRounds = 10;

router.post('/signup', async(req, res, next) => {
  const { name, email, password } = req.body
  const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
  const validDataSchema = {
    name: [examNotEmpty, examString],
    email: [examNotEmpty, examString],
    password: [examNotEmpty, examString],
  }
  for (const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      reponse(res, {status: 400})
      return
    }
    if (!passwordPattern.test(password)) {
      reponse(res, {status: 400, message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'})
      return
    }
  }
  try {
    const user = dataSource.getRepository('User')
    const exist = await user.findOne({
      where: { email }
    })
    if (exist) {
      reponse(res, {status: 409, message: 'Email 已被使用'})
      return
    }
    const hashPassword = await bcrypt.hash(password, saltRounds)
    const newUser = user.create({
      name,
      email,
      role: 'USER',
      password: hashPassword
    })
    const savedUser = await user.save(newUser)
    reponse(res, {status: 201, data: {
      user: {
        id: savedUser.id,
        name: savedUser.name
      }
    }})

  } catch (error) {
    console.log(error)
    logger.error(error)
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body
  const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;

  const validDataSchema = {
    email: [examNotEmpty, examString],
    password: [examNotEmpty, examString],
  }

  for (const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      reponse(res, {status: 400})
      return
    }
    if (!passwordPattern.test(password)) {
      reponse(res, {status: 400, message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'})
      return
    }
  }

  try {
    const user = dataSource.getRepository('User')
    const exist = await user.findOne({
      select: ['id', 'name', 'password'],
      where: { email }
    })
    if (!exist) {
      reponse(res, {status: 400, message: '使用者不存在或密碼輸入錯誤'})
      return
    }
    const isMatchPassword = await bcrypt.compare(password, exist.password)
    if (!isMatchPassword) {
      reponse(res, {status: 400, message: '使用者不存在或密碼輸入錯誤'})
      return
    }

    const token = await generateJWT({
      id: exist.id
    }, config.get('secret.jwtSecret'), {
      expiresIn: `${config.get('secret.jwtExpiresDay')}`
    })
    reponse(res, {status: 201, data: {
      token,
      user: {
        name: exist.name
      }
    }})
  } catch (error) {
    console.log(error)
    next(error)
  }
})

router.get('/profile', auth, async(req, res, next) => {
  const { id } = req.user
  try {
    const userRepository = dataSource.getRepository('User')
    const user = await userRepository.findOne({
      select: ['name', 'email'],
      where: {
        id
      }
    })
    reponse(res, {status: 200, data: { user }})
  }catch(error) {
    next(error)
  }
})

router.put('/profile', auth, async (req, res, next) => {
  const { id } = req.user
  const { name } = req.body
  if (!examNotEmpty(name) || !examString(name)) {
    reponse(res, {status: 400})
    return
  }
  try {
    const userRepository = dataSource.getRepository('User')
    const user = await userRepository.findOne({
      select: ['name'],
      where: { id }
    })
    if (user.name === name) {
      reponse(res, {status: 400, message: '使用者名稱未變更'})
      return
    }
    const useUpdateResult = await userRepository.update({
      id, name: user.name,
    }, {
      name,
    })
    if (useUpdateResult.affected === 0) {
      reponse(res, {status: 400, message: '更新使用者資料失敗'})
      return
    }
    const result = await userRepository.findOne({
      select: ['name'],
      where: {
        id
      }
    })
    reponse(res, {status: 200, data: {
      user: result
    }})
  } catch (error) {
    next(error)
  }
})


module.exports = router