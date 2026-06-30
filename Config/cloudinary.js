const cloudinary = require('cloudinary');
const multerStorageCloudinary = require('multer-storage-cloudinary');

const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage 
  ? multerStorageCloudinary.CloudinaryStorage 
  : multerStorageCloudinary;

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, 
  params: {
    folder: 'todo_attachments',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx']
  }
});

module.exports = storage;