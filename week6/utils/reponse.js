const getStatus = (statusNumber) => {
  switch(true) {
    case statusNumber >= 400 && statusNumber < 500:
      return {
        status: 'faild',
        message: '欄位未填寫正確'
      }
    case statusNumber >= 200 && statusNumber < 300:
      return {
        status: 'success',
      }
    default:
      return {
        status: 'error',
        message: '伺服器錯誤'
      }
  }
}
module.exports = (res, option) => {
  const statusData = getStatus(option.status);
  if (option.message) statusData.message = option.message;
  if (option.data) statusData.data = option.data;
  res.status(option.status).json({...statusData})
}