const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_secret:process.env.API_SECRET,
    api_key:process.env.API_KEY
})
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_Dev',
      allowed_format: ['jpeg','png','pdf'],
     
    },
  });
  module.exports={
    cloudinary,
    storage
  }