const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/


const isNotPasswordRule = (password) => !passwordPattern.test(password)
isNotPasswordRule.message = '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'

module.exports = isNotPasswordRule