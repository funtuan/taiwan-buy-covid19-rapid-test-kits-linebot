
const math = require('mathjs')
const dayjs = require('dayjs')
const Cron = require('croner')
const Point = require('../models/Point')

const wait = (delay = 0) =>
  new Promise((resolve) => setTimeout(resolve, delay))

class PointHistoryOpenEngine {
  constructor() {
    this.pointPointHistoryOpens = []
    this.maxDay = 8
    this.maxQuantiyDiff = 10
    this.maxHistoryDiff = 30 * 60 * 1000
    this.allowHistoryCount = 5
    this.allowTotalQuantity = 10
    this.predictMaxSD = 10
    this.predictMinCount = 4
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
      const pointPointHistoryOpen = newPointPointHistoryOpens.find((one) => one.code === point.code)

      pointPointHistoryOpen.openHistory.push({
        startDate,
        totalQuantity,
      })
    }

    const prefixInteger = (num, m) => {
      return (Array(m).join(0) + num).slice(-m)
    }

    const predictPointPointHistoryOpen = (code) => {
      const pointPointHistoryOpen = newPointPointHistoryOpens.find((one) => one.code === code)
      const times = pointPointHistoryOpen.openHistory.map((one) => one.startDate.getHours() * 60 + one.startDate.getMinutes())

      if (times.length >= this.predictMinCount && math.std(times) < this.predictMaxSD) {
        const roundTime = Math.round(math.mean(times) / 10) * 10
        pointPointHistoryOpen.predictTime = roundTime
        pointPointHistoryOpen.predictText = `${prefixInteger(Math.floor(roundTime / 60), 2)}:${prefixInteger(roundTime % 60, 2)}`
      } else {
        pointPointHistoryOpen.predictTime = null
        pointPointHistoryOpen.predictText = null
      }
    }

    let index = 0
    for (const point of points) {
      let historyCount = 0
      let totalQuantity = 0
      let startHistoryUpdateDate
      let lastHistoryUpdateDate
      let lastHistoryQuantity

      newPointPointHistoryOpens.push({
        code: point.code,
        name: point.name,
        note: point.note,
        address: point.address,
        openHistory: [],
      })

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

      predictPointPointHistoryOpen(point.code)

      index++
      if (index % 20 === 0) {
        await wait(10)
      }
    }

    this.pointPointHistoryOpens = newPointPointHistoryOpens

    const used = process.memoryUsage().heapUsed / 1024 / 1024
    console.log(`[PointHistoryOpenEngine] The script uses approximately ${Math.round(used * 100) / 100} MB`)
  }

  findOneByCode(code) {
    return this.pointPointHistoryOpens.find((one) => one.code === code)
  }

  init() {
    this.loadData()

    Cron('45 3 * * * *', () => {
      this.loadData()
    })
  }
}

const pointHistoryOpenEngine = new PointHistoryOpenEngine()

module.exports = pointHistoryOpenEngine
