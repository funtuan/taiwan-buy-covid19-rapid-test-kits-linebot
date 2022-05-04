
const dayjs = require('dayjs')
const pointEngine = require('../pointEngine')

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

  return diffQuantityText || `庫存 ${item.quantity} 份（尚未開賣）`
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
          'type': 'uri',
          'label': '打電話店家',
          'uri': `tel:${point.phone}`,
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
