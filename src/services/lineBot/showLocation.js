

module.exports = async (event, {
  name,
  address,
  lat,
  lng,
}) => {
  if (!event.source || !event.source.userId || event.type !== 'postback') {
    console.log('[showLocation] event is not valid', event)
    return
  }

  await event.reply([{
    type: 'location',
    title: name,
    address,
    latitude: lat,
    longitude: lng,
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
