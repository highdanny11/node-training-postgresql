const getStatus = (statusNumber) => {
  switch(true) {
    case statusNumber >= 400 && statusNumber < 500:
      return 'faild'
    case statusNumber >= 200 && statusNumber < 300:
      return 'success'
    default:
      return 'error'
  }
}
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.status = statusCode;
    this.statusMessage = getStatus(statusCode)
  }
}

module.exports = ApiError;