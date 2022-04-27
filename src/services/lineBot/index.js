
const linebot = require('linebot')
const lineBotConfig = require('../../config/lineBot')

const bot = linebot(lineBotConfig)

const lineUserSetLocation = require('./lineUserSetLocation')
const homePage = require('./homePage')
const showLocation = require('./showLocation')
const newHistoryPage = require('./newHistoryPage')
const nearbyQuantityPage = require('./nearbyQuantityPage')

bot.on('follow', async (event) => {
  await homePage(event)
})

bot.on('message', async (event) => {
  // 更改查詢地點
  if (event.message && event.message.type === 'location') {
    await lineUserSetLocation(event)
    await homePage(event)
  }

  if (event.message && event.message.type === 'text' && event.message.text.indexOf('@') !== 0) {
    await homePage(event)
  }
})

bot.on('postback', async (event) => {
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
})

bot.listen('/linewebhook', lineBotConfig.port)
