const cloudinary = require('cloudinary').v2;
// 🟢 FIXED: Added curly braces to destructure CloudinaryStorage correctly
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 

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