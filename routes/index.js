const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

require('dotenv').config()

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
    cb('Error: Images Only!')
  }
}

// Index page
router.get('/', (req, res, next) => {
  let social = db.get('social').value(),
    skills = db.get('skills').value(),
    products = db.get('products').value()

  res.render('pages/index', {
    social: social,
    skills: skills,
    products: products,
    msgemail: req.flash('msgemail')
  });
});

router.post('/', (req, res, next) => {
  db.get('feedback')
    .push ({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
    })
    .write()
  req.flash('msgemail', 'Sending was successful')
  res.redirect('/')
});

// Login page
router.get('/login', (req, res, next) => {
  let social = db.get('social').value()
  res.render('pages/login', {
    social: social,
    msglogin: req.flash('msglogin')
  });
});

router.post('/login', async (req, res, next) => {
  try {
    if(req.body.email === process.env.EMAIL &&
      req.body.password === process.env.PASS) {
        req.flash('msglogin', 'Authorization was successful')
        res.redirect('/admin')
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      db.get('users')
        .push ({
          email: req.body.email,
          password: hashedPassword
        })
        .write()
      req.flash('msglogin', 'Wrong email or password')
      res.redirect('/login')
    }
  } catch {
    res.status(500).send()
  }
})

// Admin page
router.get('/admin', (req, res, next) => {
  res.render('pages/admin', {
    msgskill: req.flash('msgskill'),
    msgfile: req.flash('msgfile')
  });
});

router.post('/admin/skills', (req, res, next) => {
  if(req.body.age !=='') {
    db.get('skills')
      .find({id: 1})
      .assign({number: Number(req.body.age)})
      .write()
  }
  if(req.body.concerts !=='') {
    db.get('skills')
      .find({id: 2})
      .assign({number: Number(req.body.concerts)})
      .write()
  }
  if(req.body.cities !=='') {
    db.get('skills')
      .find({id: 3})
      .assign({number: Number(req.body.cities)})
      .write()
  }
  if(req.body.years !=='') {
    db.get('skills')
      .find({id: 4})
      .assign({number: Number(req.body.years)})
      .write()
  }
  req.flash('msgskill', 'Skills was changed')
  res.redirect('/admin')
});

router.post('/admin/upload', (req, res, next) => {
  upload(req, res, (err) => {
    if(err) {
      res.render('pages/admin', {
        msgfile: err
      });
    } else {
      db.get('products')
        .push({
          src: `./assets/img/products/${req.file.filename}`,
          name: req.body.name,
          price: req.body.price
        })
        .write()
      req.flash('msgfile', 'Photo was uploaded successfuly')
      res.redirect('/admin')
    }
  });
});

module.exports = router;