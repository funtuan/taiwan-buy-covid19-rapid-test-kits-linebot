
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
    diffQuantityText = diffQuantity > 0 ? `${diffText} 售出${diffQuantity}份（剩${item.quantity}份）` : `${diffText} 補充${-diffQuantity}份（剩${item.quantity}份）`
  }

  return diffQuantityText || `庫存 ${item.quantity} 份`
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
    type: 'text',
    text: `${point.name}\n${point.phone}\n${quantityText(point)}${point.note.indexOf('快篩') !== -1 ? `\n※ ${point.note}` : ''}`,
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
