
const Joi = require('joi')

const line = require('@line/bot-sdk')
const express = require('express')
const lineBotConfig = require('../../config/lineBot')

const client = new line.Client(lineBotConfig)

const lineUserSetLocation = require('./lineUserSetLocation')
const homePage = require('./homePage')
const showLocation = require('./showLocation')
const showLocationByCode = require('./showLocationByCode')
const newHistoryPage = require('./newHistoryPage')
const nearbyQuantityPage = require('./nearbyQuantityPage')
const hintLocation = require('./hintLocation')
const apiRecommend = require('./apiRecommend')

async function followHandleEvent(event) {
  await homePage(event)
}

async function messageHandleEvent(event) {
  // 更改查詢地點
  if (event.message && event.message.type === 'location') {
    await lineUserSetLocation(event)
    await homePage(event)
  }

  if (event.message && event.message.type === 'text' && event.message.text.indexOf('@') !== 0) {
    await homePage(event)
  }
}

async function postbackHandleEvent(event) {
  const data = JSON.parse(event.postback.data)
  if (data.action === 'showLocation') {
    await showLocation(event, data)
  }
  if (data.action === 'showLocationByCode') {
    await showLocationByCode(event, data)
  }
  if (data.action === 'newHistoryPage') {
    await newHistoryPage(event, data)
  }
  if (data.action === 'nearbyQuantityPage') {
    await nearbyQuantityPage(event, data)
  }
  if (data.action === 'hintLocation') {
    await hintLocation(event, data)
  }
}

module.exports = () => {
  const app = express()

  app.post('/linewebhook', line.middleware(lineBotConfig), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))

    res.send('ok')
  })

  // event handler
  function handleEvent(event) {
    event.reply = (message) => {
      return client.replyMessage(event.replyToken, message)
    }

    if (event.type === 'follow') {
      followHandleEvent(event)
    }
    if (event.type === 'message') {
      messageHandleEvent(event)
    }
    if (event.type === 'postback') {
      postbackHandleEvent(event)
    }

    return Promise.resolve('ok')
  }

  app.get('/', (req, res) => {
    res.send('ok')
  })

  app.get('/api/recommend', (req, res) => {
    const schema = Joi.object({
      lat: Joi.number()
          .min(24).max(26).required(),
      lng: Joi.number()
          .min(120).max(123).required(),
      minQuantity: Joi.number().min(0).max(200).required(),
      maxNewHistoryTime: Joi.number().min(0).max(60 * 24).required(),
    })

    const { error, value } = schema.validate(req.query)
    if (error) {
      res.status(400).send(error.message)
      return
    }

    const json = apiRecommend(value)
    res.send(Object.keys(json).join(',') + '\n' + Object.values(json).join(','))
  })
  app.listen(lineBotConfig.port, () => {
    console.log(`listening on ${lineBotConfig.port}`)
  })
}
