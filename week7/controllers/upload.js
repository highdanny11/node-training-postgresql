const catchAsync = require('../utils/catchAsync')
const { uploadService } = require('../services');



const postUploadImage = catchAsync(async (req, res, next) => {
  const imageUrl = await uploadService.uploadImage(req, next)
  res.status(200).json({
    status: 'success',
    data: {
      image_url: imageUrl
    }
  })
})

module.exports = {
  postUploadImage
}
