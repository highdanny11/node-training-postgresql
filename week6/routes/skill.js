const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')
const examNotEmpty = require('../utils/examNotEmpty')
const examString = require('../utils/examString')
const reponse = require('../utils/reponse')


router.get('/', async (req, res, next) => {
  try {
    const skillList = await dataSource.getRepository("SKILL").find({
      select: ['id', 'name']
    })
    reponse(res, {status: 200, data: skillList})
  }catch(error) {
    logger.error(error)
    next(error)
  }
  
})

router.post('/', async (req, res, next) => {
  const { name } = req.body
  if (!examNotEmpty(name) || !examString(name) ) {
    reponse(res, {status: 400})
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
      reponse(res, {status: 409, message: "資料重複"})
      return;
    }
    const newSkill = await skill.create({ name })
    const result = await skill.save(newSkill)

    reponse(res, {status: 200, data: result})

  }catch(error) {
    logger.error(error)
    next(error)
  }
})

router.delete('/:skillId', async (req, res, next) => {
  const { skillId } = req.params
  if (!examNotEmpty(skillId) || !examString(skillId) ) {
    reponse(res, {status: 400})
    return
  }
  try {
    const result = await dataSource.getRepository("SKILL").delete(skillId)

    if (!result.affected) {
      reponse(res, {status: 400, message: "ID錯誤"})
      return
    }
    reponse(res, { status: 200 })
  }catch(error) {
    console.log(error)
    logger.error(error)
    next(error)
  }
})

module.exports = router