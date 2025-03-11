const ApiError = require('../utils/ApiError')
const { dataSource } = require('../db/data-source')

const getCreditPackage = async() => {
  const creditPackagesRepo = dataSource.getRepository('CreditPackage')
  const creditPackages = await creditPackagesRepo.find({
    select: ['id', 'name', 'credit_amount', 'price']
  })
  return creditPackages
}

const createCreditPackage = async(name, creditAmount, price) => {
  const creditPackageRepo = dataSource.getRepository('CreditPackage')
  const existCreditPackage = await creditPackageRepo.findOne({
    where: {
      name
    }
  })
  if (existCreditPackage) throw new ApiError(409, '資料重複')

  const newCreditPackage = await creditPackageRepo.create({
    name,
    credit_amount: creditAmount,
    price
  })
  const result = await creditPackageRepo.save(newCreditPackage)
  return result
}

const buyCreditPackage = async(userId, creditPackageId) => {
  const creditPackageRepo = dataSource.getRepository('CreditPackage')
  const creditPackage = await creditPackageRepo.findOneBy({
    id: creditPackageId
  })
  if (!creditPackage) throw new ApiError(400, 'ID錯誤')

  const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
  const newPurchase = await creditPurchaseRepo.create({
    user_id: userId,
    credit_package_id: creditPackageId,
    purchased_credits: creditPackage.credit_amount,
    price_paid: creditPackage.price,
    purchaseAt: new Date().toISOString()
  })
  await creditPurchaseRepo.save(newPurchase)
  return newPurchase
}

const deleteCreditPackage = async(creditPackageId) => {
  const creditPackageRepo = dataSource.getRepository('CreditPackage')
  const result = await creditPackageRepo.delete(creditPackageId)
  if (result.affected === 0) throw new ApiError(400, 'ID錯誤')
  return result
}

module.exports = {
  getCreditPackage,
  createCreditPackage,
  buyCreditPackage,
  deleteCreditPackage
}