
const dayjs = require('dayjs')
const pointEngine = require('../pointEngine')
const pointHistoryOpenEngine = require('../pointHistoryOpenEngine')

const quantityText = (item) => {
  let diffText
  let diffQuantityText
  if (item.history.length >= 2) {
    const lastHistory = item.history[item.history.length - 1]
    const secondLastHistory = item.history[item.history.length - 2]
    const diffQuantity = secondLastHistory.quantity - lastHistory.quantity
    const diffMinute = dayjs().diff(dayjs(lastHistory.updateDate), 'minute')
    diffText = diffMinute >= 60 ? `${Math.floor(diffMinute / 60)} 小時前` : `${diffMinute} 分鐘前`
    diffQuantityText = (diffQuantity > 0 && diffQuantity < 30) ? `${diffText} 售出${diffQuantity}份（剩${item.quantity}份）` : null
  }

  let predictText = '尚未開賣'
  if (!diffQuantityText) {
    const p = pointHistoryOpenEngine.findOneByCode(item.code)
    const nowTime = new Date().getHours() * 60 + new Date().getMinutes()
    if (p && p.predictTime && p.predictTime > nowTime) {
      predictText = `預測 ${p.predictText} 開賣`
    }
  }

  return diffQuantityText || `庫存 ${item.quantity} 份（${predictText}）`
}

module.exports = async (event, {
  code,
}) => {
  if (!event.source || !event.source.userId || event.type !== 'postback') {
    console.log('[showLocationByCode] event is not valid', event)
    return
  }

  const point = pointEngine.findOneByCode(code)
  if (!point) {
    await event.reply([{
      type: 'text',
      text: '查無此地點',
    }])
    return
  }

  await event.reply([{
    'type': 'template',
    'altText': point.name,
    'template': {
      'type': 'buttons',
      'text': `${point.name}\n${quantityText(point)}${point.note.length > 1 ? `\n※ ${point.note}` : ''}`.slice(0, 159),
      'actions': [
        {
          'type': 'postback',
          'label': '歷史開賣時間',
          'text': `@查看歷史開賣時間 ${point.name}`,
          'data': JSON.stringify({
            'action': 'showOpenHistory',
            'code': point.code,
          }),
        },
        {
          'type': 'message',
          'label': '打電話店家',
          'text': `@請體諒藥局人員，非必要請勿撥打電話\n${point.name} ${point.phone}`,
        },
        {
          'type': 'postback',
          'label': '刷新庫存',
          'text': `@查看地點 ${point.name}`,
          'data': JSON.stringify({
            'action': 'showLocationByCode',
            'code': point.code,
          }),
        },
      ],
    },
  }, {
    type: 'location',
    title: point.name,
    address: point.address,
    latitude: point.lat,
    longitude: point.lng,
    quickReply: {
      'items': [{
        'type': 'action',
        'action': {
          'type': 'location',
          'label': '更改查詢地點',
        },
      }],
    },
  }])
}
