const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')
const examNotEmpty = require('../utils/examNotEmpty')
const examString = require('../utils/examString')


router.get('/', async (req, res, next) => {
  try {
    const skillList = await dataSource.getRepository("SKILL").find({
      select: ['id', 'name']
    })
    res.status(200).json({
      status: 'success',
      data: skillList
    })
  }catch(error) {
    logger.error(error)
    next(error)
  }
  
})

router.post('/', async (req, res, next) => {
  const { name } = req.body
  if (!examNotEmpty(name) || !examString(name) ) {
    res.status(400).json({
      status: "failed",
      message: "欄位未填寫正確"
    })
    return
  }
  try {
    const skill = await dataSource.getRepository("SKILL")
    const exist = await skill.find({
      where: {
        name: name
      }
    })
    if (exist.length) {
      res.status(409).json({
        status: 'faild',
        message: "資料重複"
      })
      return;
    }
    const newSkill = await skill.create({ name })
    const result = await skill.save(newSkill)

    res.status(200).json({
      status: 'success',
      data: result
    })

  }catch(error) {
    logger.error(error)
    next(error)
  }
})

router.delete('/:skillId', async (req, res, next) => {
  const { skillId } = req.params
  if (!examNotEmpty(skillId) || !examString(skillId) ) {
    res.status(400).json({
      status: "failed",
      message: "欄位未填寫正確"
    })
    return
  }
  try {
    const result = await dataSource.getRepository("SKILL").delete(skillId)

    if (!result.affected) {
      res.status(400).json({
        status: "failed",
        message: "ID錯誤"
      })
      return
    }

    res.status(200).json({
      status: 'success',
    })
  }catch(error) {
    console.log(error)
    logger.error(error)
    next(error)
  }
})

module.exports = router