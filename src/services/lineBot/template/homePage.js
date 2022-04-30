
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
  lng,
  lat,
  address,
  totalSalesVolume,
  totalQuantity,
  averageTotalSalesVolume,
  averageTotalQuantity,
  newHistory,
  nearbyQuantity,
}) => {
  const newHistoryContent = newHistory.reduce((acc, item) => {
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

  let totalSalesVolumeText
  if ((totalSalesVolume / averageTotalSalesVolume) > 1.02) {
    totalSalesVolumeText = `高於平均 ${Math.floor((totalSalesVolume / averageTotalSalesVolume) * 100) - 100}%`
  } else if ((totalSalesVolume / averageTotalSalesVolume) < 0.98) {
    totalSalesVolumeText = `低於平均 ${100 - Math.floor((totalSalesVolume / averageTotalSalesVolume) * 100)}%`
  }

  let totalQuantityText
  if ((totalQuantity / averageTotalQuantity) > 1.02) {
    totalQuantityText = `高於平均 ${Math.floor((totalQuantity / averageTotalQuantity) * 100) - 100}%`
  } else if ((totalQuantity / averageTotalQuantity) < 0.98) {
    totalQuantityText = `低於平均 ${100 - Math.floor((totalQuantity / averageTotalQuantity) * 100)}%`
  }


  return {
    'type': 'flex',
    'altText': `快篩販賣數據統計：${address}`,
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
                'action': {
                  'type': 'postback',
                  'label': '更改查詢地點',
                  'text': `@更改查詢地點`,
                  'data': JSON.stringify({
                    'action': 'hintLocation',
                  }),
                },
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
            'text': '快篩販賣數據統計',
            'weight': 'bold',
            'size': 'xl',
            'color': '#8DD270FF',
            'action': {
              'type': 'message',
              'label': '取得最新數據',
              'text': `取得最新數據`,
            },
            'contents': [],
          },
          {
            'type': 'text',
            'text': '5公里, 24小時內',
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
            'contents': [
              {
                'type': 'box',
                'layout': 'baseline',
                'spacing': 'sm',
                'contents': [
                  {
                    'type': 'text',
                    'text': '銷售量',
                    'size': 'sm',
                    'color': '#4C4C4CFF',
                    'flex': 2,
                    'contents': [],
                  },
                  {
                    'type': 'text',
                    'text': `${totalSalesVolume} 份`,
                    'size': 'sm',
                    'color': '#4C4C4CFF',
                    'flex': 5,
                    'wrap': true,
                    'contents': [],
                  },
                ],
              },
              {
                'type': 'box',
                'layout': 'baseline',
                'spacing': 'sm',
                'contents': [
                  {
                    'type': 'text',
                    'text': '相較全國',
                    'size': 'sm',
                    'color': '#AAAAAA',
                    'flex': 2,
                    'contents': [],
                  },
                  {
                    'type': 'text',
                    'text': totalSalesVolumeText ? totalSalesVolumeText : '-',
                    'size': 'sm',
                    'color': (totalSalesVolume / averageTotalSalesVolume) > 1.02 ? '#D98484FF' : '#84C1D9FF',
                    'flex': 5,
                    'wrap': true,
                    'contents': [],
                  },
                ],
              },
              {
                'type': 'box',
                'layout': 'baseline',
                'spacing': 'sm',
                'contents': [
                  {
                    'type': 'text',
                    'text': '剩餘庫存',
                    'size': 'sm',
                    'color': '#4C4C4CFF',
                    'flex': 2,
                    'contents': [],
                  },
                  {
                    'type': 'text',
                    'text': `${totalQuantity} 份`,
                    'size': 'sm',
                    'color': '#4C4C4CFF',
                    'flex': 5,
                    'wrap': true,
                    'contents': [],
                  },
                ],
              },
              {
                'type': 'box',
                'layout': 'baseline',
                'spacing': 'sm',
                'contents': [
                  {
                    'type': 'text',
                    'text': '相較全國',
                    'size': 'sm',
                    'color': '#AAAAAA',
                    'flex': 2,
                    'contents': [],
                  },
                  {
                    'type': 'text',
                    'text': totalQuantityText ? totalQuantityText : '-',
                    'size': 'sm',
                    'color': (totalQuantity / averageTotalQuantity) > 1.02 ? '#D98484FF' : '#84C1D9FF',
                    'flex': 5,
                    'wrap': true,
                    'contents': [],
                  },
                ],
              },
              {
                'type': 'box',
                'layout': 'baseline',
                'spacing': 'sm',
                'contents': [
                  {
                    'type': 'text',
                    'text': '最近庫存',
                    'size': 'sm',
                    'color': '#4C4C4CFF',
                    'flex': 2,
                    'contents': [],
                  },
                  {
                    'type': 'text',
                    'text': nearbyQuantity.length > 0 ? `${Math.floor(nearbyQuantity[0].distance * 1000)}公尺` : '附近無庫存',
                    'size': 'sm',
                    'color': '#4C4C4CFF',
                    'flex': 5,
                    'wrap': true,
                    'contents': [],
                  },
                ],
              },
            ],
          },
          {
            'type': 'box',
            'layout': 'vertical',
            'contents': [
              {
                'type': 'spacer',
                'size': 'xl',
              },
              {
                'type': 'separator',
                'color': '#C4C4C4FF',
              },
              {
                'type': 'spacer',
              },
            ],
          },
          {
            'type': 'text',
            'text': '即時出售記錄',
            'weight': 'bold',
            'size': 'xl',
            'color': '#8DD270FF',
            'action': {
              'type': 'postback',
              'label': '更多出售記錄',
              'text': `@更多出售記錄`,
              'data': JSON.stringify({
                'action': 'newHistoryPage',
                'page': 0,
              }),
            },
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
            'contents': newHistoryContent.length > 0 ? newHistoryContent : [{
              'type': 'text',
              'text': '24小時內無最新資料',
              'size': 'sm',
              'color': '#AAAAAA',
              'flex': 2,
              'contents': [],
            }],
          },
          {
            'type': 'box',
            'layout': 'vertical',
            'contents': [
              {
                'type': 'spacer',
                'size': 'xl',
              },
              {
                'type': 'separator',
                'color': '#C4C4C4FF',
              },
              {
                'type': 'spacer',
              },
            ],
          },
          {
            'type': 'text',
            'text': '附近快篩庫存',
            'weight': 'bold',
            'size': 'xl',
            'color': '#8DD270FF',
            'action': {
              'type': 'postback',
              'label': '更多附近庫存',
              'text': `@更多附近庫存`,
              'data': JSON.stringify({
                'action': 'nearbyQuantityPage',
                'page': 0,
              }),
            },
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
              'label': '更多出售記錄',
              'text': `@更多出售記錄`,
              'data': JSON.stringify({
                'action': 'newHistoryPage',
                'page': 0,
              }),
            },
            'height': 'sm',
            'style': 'link',
          },
          {
            'type': 'button',
            'action': {
              'type': 'postback',
              'label': '更多附近庫存',
              'text': `@更多附近庫存`,
              'data': JSON.stringify({
                'action': 'nearbyQuantityPage',
                'page': 0,
              }),
            },
            'height': 'sm',
            'style': 'link',
          },
          {
            'type': 'button',
            'action': {
              'type': 'postback',
              'label': '更改查詢地點',
              'text': `@更改查詢地點`,
              'data': JSON.stringify({
                'action': 'hintLocation',
              }),
            },
            'height': 'sm',
            'style': 'link',
          },
          {
            'type': 'button',
            'action': {
              'type': 'uri',
              'label': '地圖查詢 by kiang',
              'uri': `https://kiang.github.io/antigen/#pos/${lng}/${lat}`,
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
