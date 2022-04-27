
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

Model.add = async ({
  code,
  name,
  address,
  lat,
  lng,
  phone,
  label,
  quantity,
  updateDate,
  note,
}) => {
  let point = await Model.findOne({ code })

  if (!point) {
    point = new Model({
      code,
      name,
      address,
      lat,
      lng,
      phone,
      label,
      quantity,
      updateDate,
      note,
      history: [{
        quantity,
        updateDate,
      }],
    })
  } else {
    point.set(_.omitBy({
      code,
      name,
      address,
      lat,
      lng,
      phone,
      label,
      quantity,
      updateDate,
      note,
    }, _.isUndefined) )
  }

  const history = point.history
  history.sort((a, b) => a.updateDate - b.updateDate)
  const lastHistory = history[history.length - 1]
  if (lastHistory.updateDate < updateDate && lastHistory.quantity !== quantity && lastHistory.updateDate.toISOString() !== updateDate.toISOString()) {
    history.push({
      quantity,
      updateDate,
    })
    point.history = history
  }

  await point.save()
}

module.exports = Model
