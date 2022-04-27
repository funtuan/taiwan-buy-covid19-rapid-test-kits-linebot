

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
  }])
}
