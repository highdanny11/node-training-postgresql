const examNotEmpty = (val) => {
  if (val !== undefined && val !== null && val !== '') return true
  return false
}

module.exports = examNotEmpty