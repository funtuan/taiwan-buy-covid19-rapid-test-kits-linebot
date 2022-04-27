
const LineUserLocation = require('../../models/LineUserLocation')

module.exports = async (event) => {
  if (!event.source || !event.source.userId || !event.message || !event.message.type || event.message.type !== 'location') {
    console.log('[lineUserSetLocation] event is not valid', event)
    return
  }

  const lineUserLocation = await LineUserLocation.findOne({ userId: event.source.userId })

  if (!lineUserLocation) {
    await LineUserLocation.create({
      userId: event.source.userId,
      address: event.message.address.replace(new RegExp('[0-9]*台灣'), ''),
      lat: event.message.latitude,
      lng: event.message.longitude,
    })
  } else {
    lineUserLocation.set({
      address: event.message.address.replace(new RegExp('[0-9]*台灣'), ''),
      lat: event.message.latitude,
      lng: event.message.longitude,
    })
    await lineUserLocation.save()
  }
}
