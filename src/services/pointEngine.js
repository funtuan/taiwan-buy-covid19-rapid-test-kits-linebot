
const _ = require('lodash')
const dayjs = require('dayjs')
const Cron = require('croner')
const Point = require('../models/Point')

class PointEngine {
  constructor() {
    this.points = []
  }

  async loadData() {
    const data = await Point.find()
    console.log('[PointEngine] loadData', data.length)
    this.points = data.map((one) => {
      one.history = one.history.filter((one) => dayjs().diff(dayjs(one.updateDate), 'hour') < 24)
      return one.toJSON()
    })
  }

  distance(lat1, lon1, lat2, lon2, unit = 'K') {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0
    } else {
      const radlat1 = Math.PI * lat1 / 180
      const radlat2 = Math.PI * lat2 / 180
      const theta = lon1 - lon2
      const radtheta = Math.PI * theta / 180
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
      if (dist > 1) {
        dist = 1
      }
      dist = Math.acos(dist)
      dist = dist * 180 / Math.PI
      dist = dist * 60 * 1.1515
      return dist = dist * 1.609344
    }
  }

  statistical(points) {
    const totalSalesVolume = points.reduce((acc, one) => {
      const history = one.history
      for (let i = 1; i < history.length; i++) {
        if (history[i].quantity < history[i - 1].quantity) {
          acc += history[i - 1].quantity - history[i].quantity
        }
      }
      return acc
    }, 0)

    const totalQuantity = points.reduce((acc, one) => acc + one.quantity, 0)

    return {
      totalSalesVolume,
      totalQuantity,
    }
  }

  newHistory(points, {
    start = 0,
    limit = 3,
  }) {
    const allHistory = points
        .filter((one) => one.history.length >= 2)
        .reduce((acc, one) => {
          return acc.concat(one.history.map((o) => ({
            code: one.code,
            quantity: o.quantity,
            updateDate: o.updateDate,
          })))
        }, [])

    allHistory.sort((a, b) => {
      return b.updateDate - a.updateDate
    })

    return _.uniqBy(allHistory, 'code')
        .slice(start, start + limit)
        .map((one) => {
          return points.find((o) => o.code === one.code)
        })
  }

  nearbyQuantity(points, {
    start = 0,
    limit = 3,
  }) {
    return points
        .filter((one) => one.quantity > 0)
        .slice(start, start + limit)
  }

  findOneByCode(code) {
    return this.points.find((one) => one.code === code)
  }

  findByLocation(lat, lng, {
    limit = 100,
    statistical = true,
    newHistory = true,
    newHistoryStart = 0,
    newHistoryLimit = 3,
    nearbyQuantity = true,
    nearbyQuantityStart = 0,
    nearbyQuantityLimit = 3,
  } = {}) {
    const points = this.points
        .map((one) => ({
          ...one,
          distance: this.distance(lat, lng, one.lat, one.lng),
        }))
        .filter((one) => {
          return one.distance < 5
        })
        .sort((a, b) => {
          return a.distance - b.distance
        })
        .slice(0, limit)

    return {
      points,
      statistical: statistical ? this.statistical(points) : null,
      newHistory: newHistory ? this.newHistory(points, {
        start: newHistoryStart,
        limit: newHistoryLimit,
      }) : null,
      nearbyQuantity: nearbyQuantity ? this.nearbyQuantity(points, {
        start: nearbyQuantityStart,
        limit: nearbyQuantityLimit,
      }) : null,
    }
  }
}

const pointEngine = new PointEngine()
pointEngine.loadData()

Cron('30 * * * * *', pointEngine.loadData)

module.exports = pointEngine
