
const LineUserLocation = require('../../models/LineUserLocation')

module.exports = async (event) => {
  if (!event.source || !event.source.userId || event.type !== 'postback') {
    console.log('[moreMenu] event is not valid', event)
    return
  }

  const lineUserLocation = await LineUserLocation.findByUserId(event.source.userId)
  console.log('[moreMenu] lineUserLocation 更多功能')

  await event.reply([{
    'type': 'template',
    'altText': '更多功能',
    'template': {
      'type': 'buttons',
      'text': '更多功能',
      'actions': [
        {
          'type': 'uri',
          'label': '地圖查詢 by kiang',
          'uri': `https://kiang.github.io/antigen/#pos/${lineUserLocation.lng}/${lineUserLocation.lat}`,
        },
        {
          'type': 'uri',
          'label': '問題回報',
          'uri': `https://forms.gle/GFYNFMSPaXiYfTYv6`,
        },
      ],
    },
  }])
}
