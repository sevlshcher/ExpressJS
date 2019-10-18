const express = require('express');
const multer = require('multer');
const path = require('path');

// Set Storage Engine
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'public/assets/img/products'),
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

// Init Upload for Multer
const upload = multer({
  storage: storage,
  limits: {fileSize: 1000000},
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb)
  }
}).single('photo')

// Check File Type
const checkFileType = (file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = fileTypes.test(file.mimetype)

  if(mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Images Only!'))
  }
}

module.exports = upload