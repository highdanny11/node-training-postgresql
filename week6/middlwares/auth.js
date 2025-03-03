const jwt = require('jsonwebtoken')
const generatorError = require('../utils/generatorError')

const formatVerifyError = (jwtError) => {
  let errorResult;
  switch (jwtError.name) {
    case 'JsonWebTokenError':
      errorResult = generatorError(401, 'Token 已過期')
      break;
    default:
      errorResult = generatorError(401, '無效的 token')
      break;
  }
  return errorResult
}

const verifyJWT = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(formatVerifyError(err))
      }else {
        resolve(decoded)
      }
    });
  })
}

module.exports = ({
  secret,
  repository
}) => {
  return async (req, res, next) => {
    if (!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith('Bear')) {
      next(generatorError(401, '請先登入'))
      return
    }
    const [_, token] = req.headers.authorization.split(' ')
    if (!token) {
      next(generatorError(401, '請先登入'))
      return
    }

    try {
      const verifyResult = await verifyJWT(token, secret)
      const user = await repository.findOneBy({ id: verifyResult.id }) 
      if (!user) {
        next(generatorError(401, '無效的 token'))
        return
      }
      req.user = user
      next() 
    }catch(error) {
      next(error)
    }
  }
}