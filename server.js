const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const config = require('./config/config')
const passport = require('passport')
const user = require('./routes/user')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

mongoose
  .connect(
    config.mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB successfully connected'))
  .catch(err => console.log(err))

app.use(passport.initialize())
require('./config/passport')(passport)
app.use('/api/users', user)

const port = process.env.PORT || 8400
app.listen(port, () => console.log(`Server running on port ${port} !`))
