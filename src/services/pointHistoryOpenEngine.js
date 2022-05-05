
const dayjs = require('dayjs')
const Cron = require('croner')
const Point = require('../models/Point')

class PointHistoryOpenEngine {
  constructor() {
    this.pointPointHistoryOpens = []
    this.maxDay = 8
    this.maxQuantiyDiff = 10
    this.maxHistoryDiff = 120 * 60 * 1000
    this.allowHistoryCount = 5
    this.allowTotalQuantity = 10
  }

  async loadData() {
    const data = await Point.findAllData()
    console.log('[PointHistoryOpenEngine] loadData', data.length)
    const maxDate = dayjs().subtract(this.maxDay, 'day').toDate()
    const points = data.map((one) => {
      one.history = one.history.filter((one) => (one.updateDate - maxDate) > 0)
      return one
    })

    const newPointPointHistoryOpens = []

    const addPointPointHistoryOpen = ({
      point,
      startDate,
      totalQuantity,
    }) => {
      let pointPointHistoryOpen = newPointPointHistoryOpens.find((one) => one.code === point.code)
      if (!pointPointHistoryOpen) {
        pointPointHistoryOpen = {
          code: point.code,
          name: point.name,
          note: point.note,
          address: point.address,
          openHistory: [],
        }
        newPointPointHistoryOpens.push(pointPointHistoryOpen)
      }

      pointPointHistoryOpen.openHistory.push({
        startDate,
        totalQuantity,
      })
    }

    for (const point of points) {
      let historyCount = 0
      let totalQuantity = 0
      let startHistoryUpdateDate
      let lastHistoryUpdateDate
      let lastHistoryQuantity
      for (const one of point.history) {
        if (lastHistoryUpdateDate && (one.updateDate - lastHistoryUpdateDate) < this.maxHistoryDiff && lastHistoryQuantity && lastHistoryQuantity - one.quantity < this.maxQuantiyDiff && lastHistoryQuantity - one.quantity > 0) {
          if (historyCount === 0) {
            startHistoryUpdateDate = one.updateDate
          }
          historyCount++
          totalQuantity += lastHistoryQuantity - one.quantity
        } else {
          if (historyCount >= this.allowHistoryCount && totalQuantity > this.allowTotalQuantity) {
            addPointPointHistoryOpen({
              point,
              startDate: startHistoryUpdateDate,
              totalQuantity: totalQuantity,
            })
          }
          historyCount = 0
          totalQuantity = 0
          lastHistoryQuantity = 0
        }

        lastHistoryUpdateDate = one.updateDate
        lastHistoryQuantity = one.quantity
      }
    }

    this.pointPointHistoryOpens = newPointPointHistoryOpens

    const used = process.memoryUsage().heapUsed / 1024 / 1024
    console.log(`[PointHistoryOpenEngine] The script uses approximately ${Math.round(used * 100) / 100} MB`)
  }

  findOneByCode(code) {
    console.log('[PointHistoryOpenEngine] findOneByCode', code)
    return this.pointPointHistoryOpens.find((one) => one.code === code)
  }

  init() {
    setTimeout(() => {
      this.loadData()
    }, 10 * 1000)

    Cron('45 3 * * * *', () => {
      this.loadData()
    })
  }
}

const pointHistoryOpenEngine = new PointHistoryOpenEngine()

module.exports = pointHistoryOpenEngine
