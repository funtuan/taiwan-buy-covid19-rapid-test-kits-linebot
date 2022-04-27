
const Cron = require('croner')
const Point = require('../models/Point')
const { downloadCSV } = require('../unit/download')

const mockData = [
  {
    '醫事機構代碼': 3501200000,
    '醫事機構名稱': '臺北虛擬診所',
    '醫事機構地址': '臺北市中正區衡陽路85號2樓',
    '經度': 121.510814,
    '緯度': 25.042324,
    '醫事機構電話': 27065866,
    '廠牌項目': '羅氏家用新冠病毒抗原自我檢測套組',
    '快篩試劑截至目前結餘存貨數量': 376,
    '來源資料時間': '2022/04/27 17:00:50',
    '備註': '9:30開始發號碼牌',
  },
]

const refresh = async () => {
  const json = await downloadCSV('https://data.nhi.gov.tw/Datasets/Download.ashx?rid=A21030000I-D03001-001&l=https://data.nhi.gov.tw/resource/Nhi_Fst/Fstdata.csv')

  const data = json.map((item) => ({
    code: item['醫事機構代碼'],
    name: item['醫事機構名稱'],
    address: item['醫事機構地址'],
    lat: Number(item['緯度']),
    lng: Number(item['經度']),
    phone: item['醫事機構電話'],
    label: item['廠牌項目'],
    quantity: parseInt(item['快篩試劑截至目前結餘存貨數量']),
    updateDate: new Date(item['來源資料時間']),
    note: item['備註'],
  }))
  for (const p of data) {
    await Point.add(p)
  }
  const nullPoints = await Point.find({
    code: { $nin: data.map((p) => p.code) },
  })
  for (const p of nullPoints) {
    await Point.add({
      code: p.code,
      quantity: 0,
      updateDate: new Date(),
    })
  }
}

Cron('0 * * * * *', refresh)
refresh()
