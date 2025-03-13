const formidable = require('formidable')
const firebaseAdmin = require('firebase-admin')
const ApiError = require('../utils/ApiError')
const config = require('../config/index')
const logger = require('../utils/logger')('UploadService')

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(config.get('secret.firebase.serviceAccount')),
  storageBucket: config.get('secret.firebase.storageBucket')
})
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/jpg': true
}
const bucket = firebaseAdmin.storage().bucket()

const uploadImage = async (req, next) => {
  const form = formidable.formidable({
    multiple: false,
    maxFileSize: MAX_FILE_SIZE,
    filter: ({ mimetype }) => {
      if (!ALLOWED_FILE_TYPES[mimetype]) {
        next(new ApiError(400, '不支援的檔案格式'))
        return false
      }
      return !!ALLOWED_FILE_TYPES[mimetype]
    }
  })
  const [fields, files] = await form.parse(req)
  logger.info('files')
  logger.info(files)
  logger.info('fields')
  logger.info(fields)
  const filePath = files.file[0].filepath
  const remoteFilePath = `images/${new Date().toISOString()}-${files.file[0].originalFilename}`
  await bucket.upload(filePath, { destination: remoteFilePath })
  const options = {
    action: 'read',
    expires: Date.now() + 24 * 60 * 60 * 1000
  }
  const [imageUrl] = await bucket.file(remoteFilePath).getSignedUrl(options)
  logger.info(imageUrl)

  return imageUrl
}

module.exports = {
  uploadImage
}