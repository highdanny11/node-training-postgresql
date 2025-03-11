const ApiError = require('../utils/ApiError')
const { dataSource } = require('../db/data-source')


const getSkillAll = async() => {
  const skillRepo = dataSource.getRepository('Skill')
  const skillList = await skillRepo.find({
    select: ['id', 'name']
  })
  return skillList
}

const createSkill = async(name) => {
  const skillRepo = dataSource.getRepository('Skill')
  const existSkill = await skillRepo.findOne({
    where: {
      name
    }
  })
  if (existSkill) throw new ApiError(409, '資料重複')

  const newSkill = await skillRepo.create({
    name
  })
  const result = await skillRepo.save(newSkill)
  return result
}

const deleteSkill = async (skillId) => {
  const result = await dataSource.getRepository('Skill').delete(skillId)
  if (result.affected === 0) throw new ApiError(400, 'ID錯誤')
}

module.exports = {
  getSkillAll,
  createSkill,
  deleteSkill,
}