
const dayjs = require('dayjs')
const pointHistoryOpenEngine = require('../pointHistoryOpenEngine')


module.exports = async (event, {
  code,
}) => {
  if (!event.source || !event.source.userId || event.type !== 'postback') {
    console.log('[showOpenHistory] event is not valid', event)
    return
  }

  console.log('[showOpenHistory] showOpenHistory', code)

  const point = pointHistoryOpenEngine.findOneByCode(code)
  if (!point) {
    await event.reply([{
      type: 'text',
      text: '查無此地點',
    }])
    return
  }

  await event.reply([{
    type: 'text',
    text: `${point.name} 歷史開賣時間\n${point.openHistory.map((one) => `${dayjs(one.startDate).format('MM/DD 在 HH:mm')} 開賣`).join('\n')}`,
  }])
}
