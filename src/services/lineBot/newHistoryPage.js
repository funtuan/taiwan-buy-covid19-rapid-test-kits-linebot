
const pointEngine = require('../pointEngine')
const LineUserLocation = require('../../models/LineUserLocation')
const newHistoryPageTemplate = require('./template/newHistoryPage')

module.exports = async (event, {
  page,
}) => {
  if (!event.source || !event.source.userId || event.type !== 'postback') {
    console.log('[showLocation] event is not valid', event)
    return
  }

  const lineUserLocation = await LineUserLocation.findByUserId(event.source.userId)
  const {
    newHistory,
  } = pointEngine.findByLocation(lineUserLocation.lat, lineUserLocation.lng, {
    statistical: false,
    newHistory: true,
    newHistoryStart: page * 10,
    newHistoryLimit: 10,
    nearbyQuantity: false,
  })


  await event.reply(newHistoryPageTemplate({
    address: lineUserLocation.address,
    newHistory,
    start: page * 10 + 1,
    end: page * 10 + 11,
    nextPage: page + 1,
  }))
}
