const { v2: cloudinary } = require('cloudinary');
const multerStorage = require('multer-storage-cloudinary'); 
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const StorageEngine = multerStorage.CloudinaryStorage || multerStorage;

const storage = new StorageEngine({
  cloudinary: cloudinary,
  params: {
    folder: 'todo_attachments',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'txt'],
    resource_type: 'auto' 
  }
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };