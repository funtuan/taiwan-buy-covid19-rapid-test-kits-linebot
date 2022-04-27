
const pointEngine = require('../pointEngine')
const LineUserLocation = require('../../models/LineUserLocation')
const nearbyQuantityPageTemplate = require('./template/nearbyQuantityPage')

module.exports = async (event, {
  page,
}) => {
  if (!event.source || !event.source.userId || event.type !== 'postback') {
    console.log('[nearbyQuantityPage] event is not valid', event)
    return
  }

  const lineUserLocation = await LineUserLocation.findByUserId(event.source.userId)
  const {
    nearbyQuantity,
  } = pointEngine.findByLocation(lineUserLocation.lat, lineUserLocation.lng, {
    statistical: false,
    newHistory: false,
    nearbyQuantity: true,
    nearbyQuantityStart: page * 10,
    nearbyQuantityLimit: 10,
  })


  await event.reply(nearbyQuantityPageTemplate({
    address: lineUserLocation.address,
    nearbyQuantity,
    start: page * 10 + 1,
    end: page * 10 + 11,
    nextPage: page + 1,
  }))
}
