const jwt = require('jsonwebtoken')


module.exports = (patload, secret, option = {}) => {
  return new Promise((resolve, reject) => {
    jwt.sign(patload, secret, option, (err, token) => {
      if(err) {
        reject(err)
        return
      }
      resolve(token)
    })
  })
} 