const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackageController')
const catchAsync = require('../utils/catchAsync')
const { creditPackageService } = require('../services');

function isUndefined(value) {
  return value === undefined
}

function isNotValidSting(value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger(value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

const getAll = catchAsync(async (req, res, next) => {
  const creditPackages = await creditPackageService.getCreditPackage()
  res.status(200).json({
    status: 'success',
    data: creditPackages
  })
})

const post = catchAsync(async (req, res, next) => {
  const { name, credit_amount: creditAmount, price } = req.body
  const result = await creditPackageService.createCreditPackage(name, creditAmount, price)
  res.status(200).json({
    status: 'success',
    data: result
  })
})

const postUserBuy = catchAsync(async (req, res, next) => {
  const { id } = req.user
  const { creditPackageId } = req.params
  await creditPackageService.buyCreditPackage(id, creditPackageId)
  res.status(200).json({
    status: 'success',
    data: null
  })
})

const deletePackage = catchAsync(async (req, res, next) => {
  const { creditPackageId } = req.params
  const result = await creditPackageService.deleteCreditPackage(creditPackageId)
  res.status(200).json({
    status: 'success',
    data: result
  })
})

module.exports = {
  getAll,
  post,
  postUserBuy,
  deletePackage
}
