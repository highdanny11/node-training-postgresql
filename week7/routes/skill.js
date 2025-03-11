const express = require('express')

const router = express.Router()
const skill = require('../controllers/skill')
const { createSkill } = require('../validations/skill')
const checkSkillId = require('../middlewares/checkSkillId')
const validate = require('../middlewares/validate')

router.get('/', skill.getAll)

router.post('/', validate(createSkill), skill.post)

router.delete('/:skillId', checkSkillId, skill.deletePackage)

module.exports = router
