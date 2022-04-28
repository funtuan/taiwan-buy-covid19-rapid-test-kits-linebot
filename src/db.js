
const mongoose = require('mongoose')
const {
  mongoUrl,
} = require('./config/db')


module.exports = () => {
  mongoose.connect(mongoUrl, { useNewUrlParser: true })
}
