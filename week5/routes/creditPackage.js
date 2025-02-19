const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const examNotEmpty = require('../utils/examNotEmpty')
const examNumber = require('../utils/examNumber')
const examString = require('../utils/examString')

router.get('/', async (req, res, next) => {
  try {
    const creditPackage = await dataSource.getRepository("CreditPackage").find({
      select: ['id', 'name', 'credit_amount', 'price']
    })
    res.status(200).json({
      status: 'success',
      data: creditPackage
    })
  } catch(error) {
    logger.error(error)
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const validDataSchema = {
      name: [examNotEmpty, examString],
      credit_amount: [examNotEmpty, examNumber],
      price: [examNotEmpty, examNumber],
    }
    const { name, credit_amount, price } = req.body
    for(const key in req.body) {
      const valids = validDataSchema[key]
      if (!valids.every((valid) => valid(req.body[key]))) {
        res.status(400).json({
          status: "failed",
          message: "欄位未填寫正確"
        })
        return
      }
    }

    const creditPackage = await dataSource.getRepository("CreditPackage")
    const existData = await creditPackage.find({
      where: {
        name: name
      }
    })
    if (existData.length) {
      res.status(409).json({
        status: 'faild',
        message: "資料重複"
      })
      return;
    }
    const newData = await creditPackage.create({
      name, credit_amount, price
    })
    const result = await creditPackage.save(newData)
    res.status(200).json({
      status: 'success',
      data: result
    })
  }catch(error) {
    logger.error(error)
    next(error)
  }
})

router.delete('/:creditPackageId', async (req, res, next) => {
  const { creditPackageId } = req.params
  try {
    const result = await dataSource.getRepository("CreditPackage").delete(creditPackageId)
    if (!result.affected) {
      res.status(400).json({
        status: 'faild',
        message: 'ID 錯誤'
      })  
      return;
    }
    res.status(200).json({
      status: 'success',
    })
  }catch(error) {
    logger.error(error)
    next(error)
  }
})

module.exports = router
