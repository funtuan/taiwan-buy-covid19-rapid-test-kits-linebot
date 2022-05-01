
const pointEngine = require('../pointEngine')
const dayjs = require('dayjs')

module.exports = ({
  lat,
  lng,
  minQuantity,
  maxNewHistoryTime,
}) => {
  const { points } = pointEngine.findByLocation(lat, lng, {
    statistical: false,
    newHistory: false,
    nearbyQuantity: false,
  })

  const rangePoints = points
      .filter((point) => {
        return point.quantity >= minQuantity && point.history.length >= 2
      })
      .map((point) => {
        const history = point.history.slice(-2)
        delete point.history
        return {
          ...point,
          newHistoryAt: history.length >= 2 ? history[0].updateDate : null,
          newHistorySaleQuantity: history.length >= 2 ? history[0].quantity - history[1].quantity : null,
        }
      })
      .filter((point) => {
        return (new Date() - point.newHistoryAt) < (maxNewHistoryTime * 60 * 1000)
      })

  rangePoints
      .sort((a, b) => {
        return a.distance - b.distance
      })

  return rangePoints
      .slice(0, 5)
      .map((one) => ({
        ...one,
        newHistoryAt: dayjs(one.newHistoryAt).format('YYYY-MM-DD HH:mm:ss'),
        updateDate: dayjs(one.updateDate).format('YYYY-MM-DD HH:mm:ss'),
      }))
}
