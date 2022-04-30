
const _ = require('lodash')
const Cron = require('croner')
const Point = require('../models/Point')

class PointEngine {
  constructor() {
    this.points = []
    this.maxLatLon = 5 * 1000 / 90000
  }

  async loadData() {
    const data = await Point.findAllData()
    console.log('[PointEngine] loadData', data.length)
    const dayString = new Date().toDateString()
    this.points.splice(0, this.points.length, ...data.map((one) => {
      one.history = one.history.filter((one) => dayString === one.updateDate.toDateString())
      return one
    }))
    const used = process.memoryUsage().heapUsed / 1024 / 1024
    console.log(`[PointEngine] The script uses approximately ${Math.round(used * 100) / 100} MB`)
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
        if (history[i].quantity < history[i - 1].quantity && ((history[i - 1].quantity - history[i].quantity) < 30)) {
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
    const startAt = new Date()
    const points = this.points
        .filter((item) =>
          (item.lat < (lat + this.maxLatLon)) &&
          (item.lat > (lat - this.maxLatLon)) &&
          (item.lng < (lng + this.maxLatLon)) &&
          (item.lng > (lng - this.maxLatLon)),
        )
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

    const data = {
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

    console.log(`[PointEngine] findByLocation ${new Date() - startAt} ms`)
    return data
  }

  findOneInfo(code) {
    const point = this.findOneByCode(code)
    if (!point) {
      return null
    }
    return {
      code: point.code,
      name: point.name,
      lat: point.lat,
      lng: point.lng,
      note: point.note,
      phone: point.phone,
      quantity: point.quantity,
      updateDate: point.updateDate,
      history: point.history.slice(-2),
    }
  }

  init() {
    this.loadData()

    Cron('30 * * * * *', () => {
      this.loadData()
    })
  }
}

const pointEngine = new PointEngine()

module.exports = pointEngine
