
const mongoose = require('mongoose')
const {
  mongoUrl,
} = require('./config/db')

mongoose.connect(mongoUrl, { useNewUrlParser: true })
