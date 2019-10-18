const express = require('express');
const router = express.Router();
const db = require('../models/db');
const upload = require('../libs/multer')
require('dotenv').config()

// Index page
router.get('/', (req, res, next) => {
  let social = db.get('social').value(),
    skills = db.get('skills').value(),
    products = db.get('products').value()

  res.render('pages/index', {
    social: social,
    skills: skills,
    products: products,
    msgemail: req.flash('msgemail')[0]
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
    msglogin: req.flash('msglogin')[0]
  });
});

router.post('/login', (req, res, next) => {
  if(req.body.email === process.env.EMAIL &&
    req.body.password === process.env.PASS) {
      req.flash('msglogin', 'Authorization was successful')
      res.redirect('/admin')
  } else {
    req.flash('msglogin', 'Wrong email or password')
    res.redirect('/login')
  }
});

// Admin page
router.get('/admin', (req, res, next) => {
  res.render('pages/admin', {
    msgskill: req.flash('msgskill')[0],
    msgfile: req.flash('msgfile')[0]
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

router.post('/admin/upload', upload, (req, res, next) => {
  if(req.file !== undefined && req.body.name !=='' && req.body.price !=='') {
    db.get('products')
      .push({
        src: `./assets/img/products/${req.file.filename}`,
        name: req.body.name,
        price: req.body.price
      })
      .write()
    req.flash('msgfile', 'Product was uploaded successfuly')
    res.redirect('/admin')
  } else {
    req.flash('msgfile', 'You must select a file and fill in all the fields')
    res.redirect('/admin')
  }
});

module.exports = router;