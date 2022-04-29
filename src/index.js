
require('dotenv').config()

require('./db')()
require('./services/lineBot')()
if (process.env.CRAWLER !== 'false') {
  require('./services/pointData')()
}
require('./services/pointEngine').init()
