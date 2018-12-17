const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const passport = require('passport')

const User = require('../models/userAuthModel')

const validateNewUser = require('../utils/newUserValidator')
const validateExisitngUser = require('../utils/existingUserValidator')

router.post('/signup', (req, res) => {
  const { errors, isValid } = validateNewUser(req.body)
  if (!isValid) return res.status(400).json(errors)

  const { username, password } = req.body

  User.findOne({ username }).then(user => {
    if (user) return res.status(400).json({ user: 'username is occupied' })
  })

  const newUser = new User({ username, password })

  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return res.status(500).json({ error: 'Could not generate new user' }) }
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) { return res.status(500).json({ error: 'Could not generate new user' }) }
      newUser.password = hash
      newUser
        .save()
        .then(user => res.json(user))
        .catch(err => {
          console.log(err)
          res.status(500).json({ error: 'Could not generate new user' })
        })
    })
  })
})
