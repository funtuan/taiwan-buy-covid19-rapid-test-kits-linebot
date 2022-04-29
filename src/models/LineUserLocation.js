
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LineUserLocation = new Schema({
  userId: { type: String, required: true, index: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
})

const Model = mongoose.model('LineUserLocation', LineUserLocation)

Model.findByUserId = async (userId) => {
  const lineUserLocation = await Model.findOne({ userId })

  console.log('[LineUserLocation]', lineUserLocation ? lineUserLocation.toJSON() : 'not save')
  if (!lineUserLocation) {
    return {
      address: '台北市中正區林森南路6號',
      lat: 25.043341,
      lng: 121.5226949,
    }
  }
  return lineUserLocation.toJSON()
}

module.exports = Model
