

const line = require('@line/bot-sdk')
const express = require('express')
const lineBotConfig = require('../../config/lineBot')

const client = new line.Client(lineBotConfig)

const lineUserSetLocation = require('./lineUserSetLocation')
const homePage = require('./homePage')
const showLocation = require('./showLocation')
const newHistoryPage = require('./newHistoryPage')
const nearbyQuantityPage = require('./nearbyQuantityPage')
const hintLocation = require('./hintLocation')

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

const app = express()

app.post('/linewebhook', line.middleware(lineBotConfig), (req, res) => {
  Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result))
      .catch((err) => {
        console.error(err)
        res.status(500).end()
      })
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
app.listen(lineBotConfig.port, () => {
  console.log(`listening on ${lineBotConfig.port}`)
})
