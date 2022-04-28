
const pointEngine = require('../pointEngine')
const LineUserLocation = require('../../models/LineUserLocation')
const homePageTemplate = require('./template/homePage')

const averageCount = 100
let averageTotalSalesVolume
let averageTotalQuantity

const averageStatistical = (statistical) => {
  if (!averageTotalSalesVolume) {
    averageTotalSalesVolume = statistical.totalSalesVolume
  }
  if (!averageTotalQuantity) {
    averageTotalQuantity = statistical.totalQuantity
  }

  averageTotalSalesVolume = (averageTotalSalesVolume * (averageCount - 1) + statistical.totalSalesVolume) / averageCount
  averageTotalQuantity = (averageTotalQuantity * (averageCount - 1) + statistical.totalQuantity) / averageCount

  return {
    ...statistical,
    averageTotalSalesVolume,
    averageTotalQuantity,
  }
}

module.exports = async (event) => {
  if (!event.source || !event.source.userId) {
    console.log('[homePage] event is not valid', event)
    return
  }

  const lineUserLocation = await LineUserLocation.findByUserId(event.source.userId)
  let {
    statistical,
    newHistory,
    nearbyQuantity,
  } = pointEngine.findByLocation(lineUserLocation.lat, lineUserLocation.lng)

  statistical = averageStatistical(statistical)

  try {
    await event.reply(homePageTemplate({
      address: lineUserLocation.address,
      totalSalesVolume: statistical.totalSalesVolume,
      totalQuantity: statistical.totalQuantity,
      averageTotalSalesVolume: statistical.averageTotalSalesVolume,
      averageTotalQuantity: statistical.averageTotalQuantity,
      newHistory,
      nearbyQuantity,
    }))
  } catch (error) {
    console.log('[homePage] error', error.message)
  }
}
