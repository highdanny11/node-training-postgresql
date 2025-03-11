const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('SkillController')
const catchAsync = require('../utils/catchAsync')
const { skillService } = require('../services');

const getAll = catchAsync(async (req, res, next) => {
  const skillList = await skillService.getSkillAll()
  res.status(200).json({
    status: 'success',
    data: skillList
  })
})

const post = catchAsync(async (req, res, next) => {
  const { name } = req.body
  const result = await skillService.createSkill(name)
  res.status(200).json({
    status: 'success',
    data: result
  })
})

const deletePackage = catchAsync(async (req, res, next) => {
  const { skillId } = req.params
  await skillService.deleteSkill(skillId)
  res.status(200).json({
    status: 'success'
  })
})

module.exports = {
  getAll,
  post,
  deletePackage
}
