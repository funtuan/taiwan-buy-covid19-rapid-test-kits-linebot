
const hintLocationTemplate = require('./template/hintLocation')

module.exports = async (event) => {
  if (!event.source || !event.source.userId || event.type !== 'postback') {
    console.log('[hintLocation] event is not valid', event)
    return
  }

  await event.reply(hintLocationTemplate())
}
