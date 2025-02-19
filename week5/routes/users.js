const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const bcrypt = require('bcrypt')
const logger = require('../utils/logger')('Users')
const examNotEmpty = require('../utils/examNotEmpty')
const examString = require('../utils/examString')

const saltRounds = 10;

router.post('/signup', async (req, res, next) => {
  const { name, email, password } = req.body
  const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
  const validDataSchema = {
    name: [examNotEmpty, examString],
    email: [examNotEmpty, examString],
    password: [examNotEmpty, examString],
  }
  for(const key in req.body) {
    const valids = validDataSchema[key]
    if (!valids.every((valid) => valid(req.body[key]))) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
      return
    }
    if (!passwordPattern.test(password)) {
      res.status(400).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
      return
    }
  }
  try {
    const user = dataSource.getRepository('User')
    const exist = await user.findOne({
      where: { email }
    })
    if (exist) {
      res.status(409).json({
        status: 'failed',
        message: 'Email 已被使用'
      })
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
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: savedUser.id,
          name: savedUser.name
        }
      }
    })

  }catch(error) {
    console.log(error)
    logger.error(error)
    next(error)
  }
})


module.exports = router