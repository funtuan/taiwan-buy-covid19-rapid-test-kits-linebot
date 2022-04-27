
module.exports = () => ({
  'type': 'text',
  'text': '更改查詢地點方法\n1. 請點選下方「更改查詢地點」\n2. 選擇地點並按右上角分享',
  'quickReply': {
    'items': [{
      'type': 'action',
      'action': {
        'type': 'location',
        'label': '更改查詢地點',
      },
    }],
  },
})
