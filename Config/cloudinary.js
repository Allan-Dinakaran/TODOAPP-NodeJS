const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary');

// 🟢 Fallback check: Extract it if it's nested inside an object, otherwise use it directly
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage 
  ? multerStorageCloudinary.CloudinaryStorage 
  : multerStorageCloudinary;

cloudinary.config({
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