
const _ = require('lodash')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Point = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  phone: { type: String, required: true },
  label: { type: String, required: true },
  quantity: { type: Number, required: true },
  updateDate: { type: Date, required: true },
  note: { type: String },
  history: [{
    quantity: { type: Number, required: true },
    updateDate: { type: Date, required: true },
  }],
})

const Model = mongoose.model('Point', Point)

Model.findAllData = async () => {
  const data = []
  const count = await Model.count()
  const limit = 50
  for (let start = 0; start < count; start += limit) {
    const result = await Model.find().skip(start).limit(limit).lean()
    data.push(...result)
  }
  return data
}

module.exports = Model
