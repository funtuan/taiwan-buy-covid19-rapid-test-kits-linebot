
const dayjs = require('dayjs')

const quantityTemplate = (item) => {
  let diffText
  let diffTextColor
  let diffQuantityText
  if (item.history.length >= 2) {
    const lastHistory = item.history[item.history.length - 1]
    const secondLastHistory = item.history[item.history.length - 2]
    const diffQuantity = secondLastHistory.quantity - lastHistory.quantity
    const diffMinute = dayjs().diff(dayjs(lastHistory.updateDate), 'minute')
    diffTextColor = diffMinute < 60 ? '#E74F4FFF' : '#999999'
    diffText = diffMinute >= 60 ? `${Math.floor(diffMinute / 60)} 小時前` : `${diffMinute} 分鐘前`
    diffQuantityText = diffQuantity > 0 ? `${diffText} 售出${diffQuantity}份（剩${item.quantity}份）` : null
  }

  return [{
    'type': 'text',
    'text': diffQuantityText || `庫存 ${item.quantity} 份`,
    'size': 'sm',
    'color': diffTextColor || '#4C4C4CFF',
    'flex': 3,
    'contents': [],
  }]
}

module.exports = ({
  address,
  nearbyQuantity,
  start,
  end,
  nextPage,
}) => {
  const nearbyQuantityContent = nearbyQuantity.reduce((acc, item) => {
    if (acc.length !== 0) {
      acc.push({
        'type': 'box',
        'layout': 'vertical',
        'contents': [
          {
            'type': 'spacer',
          },
        ],
      })
    }
    acc.push(...[{
      'type': 'box',
      'layout': 'horizontal',
      'contents': [
        {
          'type': 'text',
          'text': `${Math.floor(item.distance * 1000)}公尺`,
          'size': 'sm',
          'color': '#999999',
          'flex': 3,
          'contents': [],
        },
        {
          'type': 'text',
          'text': '查看地點',
          'size': 'sm',
          'color': '#6289EBFF',
          'flex': 2,
          'align': 'end',
          'action': {
            'type': 'postback',
            'label': '查看地點',
            'text': `@查看地點 ${item.name}`,
            'data': JSON.stringify({
              'action': 'showLocationByCode',
              'code': item.code,
            }),
          },
          'contents': [],
        },
      ],
    },
    {
      'type': 'text',
      'text': `${item.name}`,
      'size': 'sm',
      'color': '#4C4C4CFF',
      'flex': 2,
      'contents': [],
    },
    ...quantityTemplate(item),
    ])

    return acc
  }, [])

  return {
    'type': 'flex',
    'altText': `快篩試劑查詢結果：${address}`,
    'contents': {
      'type': 'bubble',
      'body': {
        'type': 'box',
        'layout': 'vertical',
        'contents': [
          {
            'type': 'box',
            'layout': 'horizontal',
            'contents': [
              {
                'type': 'text',
                'text': address,
                'color': '#8E8E8EFF',
                'flex': 2,
                'wrap': false,
                'contents': [],
              },
            ],
          },
          {
            'type': 'box',
            'layout': 'vertical',
            'contents': [
              {
                'type': 'spacer',
              },
            ],
          },
          {
            'type': 'text',
            'text': `附近快篩庫存 ${start}~${end}`,
            'weight': 'bold',
            'size': 'xl',
            'color': '#8DD270FF',
            'contents': [],
          },
          {
            'type': 'text',
            'text': '附近5公里',
            'size': 'sm',
            'color': '#999999',
            'flex': 0,
            'margin': 'md',
            'contents': [],
          },
          {
            'type': 'box',
            'layout': 'vertical',
            'spacing': 'sm',
            'margin': 'lg',
            'contents': nearbyQuantityContent.length > 0 ? nearbyQuantityContent : [{
              'type': 'text',
              'text': '附近無店家有庫存',
              'size': 'sm',
              'color': '#AAAAAA',
              'flex': 2,
              'contents': [],
            }],
          },
        ],
      },
      'footer': {
        'type': 'box',
        'layout': 'vertical',
        'flex': 0,
        'spacing': 'sm',
        'contents': [
          {
            'type': 'button',
            'action': {
              'type': 'postback',
              'label': '下一頁附近庫存',
              'text': `@下一頁附近庫存`,
              'data': JSON.stringify({
                'action': 'nearbyQuantityPage',
                'page': nextPage,
              }),
            },
            'height': 'sm',
            'style': 'link',
          },
          {
            'type': 'button',
            'action': {
              'type': 'message',
              'label': '取得最新數據',
              'text': `取得最新數據`,
            },
            'height': 'sm',
            'style': 'link',
          },
          {
            'type': 'spacer',
            'size': 'sm',
          },
        ],
      },
    },
    'quickReply': {
      'items': [{
        'type': 'action',
        'action': {
          'type': 'location',
          'label': '更改查詢地點',
        },
      }],
    },
  }
}
