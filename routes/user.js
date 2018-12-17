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

  bcrypt
    .hash(newUser.password, 10)
    .then(hash => {
      newUser.password = hash
      newUser
        .save()
        .then(user => res.json(user))
        .catch(err => {
          console.log(err)
          res.status(500).json({ error: 'Could not generate new user' })
        })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: 'Could not generate new user' })
    })
})

router.post('/login', (req, res) => {
  const { errors, isValid } = validateExisitngUser(req.body)
  if (!isValid) return res.status(400).json(errors)

  const { username, password } = req.body

  User.findOne({ username }).then(user => {
    if (!user) return res.status(404).json({ user: 'username is not found' })

    bcrypt.compare(password, user.password).then(match => {
      if (match) {
        const payload = { id: user.id, username: user.username }
        jwt.sign(
          payload,
          config.passportKey,
          { expiresIn: 86400 },
          (err, token) => {
            if (err) {
              return res.status(500).json({ error: 'Coul not generate token' })
            }
            res.json({ success: true, token: `Bearer: ${token}` })
          }
        )
      } else {
        return res.status(400).json({ error: 'Password is not right' })
      }
    })
  })
})

router.get('/profile', (req, res) => {
  passport.authenticate('jwt', { session: false }, (req, res) => {
    res.json({id: req.user.id, username: req.user.username})
  })
})

module.exports = router
