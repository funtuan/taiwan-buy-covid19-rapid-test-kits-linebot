
const axios = require('axios')
const csv = require('csvtojson')

module.exports.downloadCSV = async (url) => {
  const csvString = await axios.get(url)
  return await csv().fromString(csvString.data)
}
