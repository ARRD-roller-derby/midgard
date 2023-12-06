const mongoose = require('mongoose')

async function mongoDb() {
  await mongoose.connect(process.env.MONGO_URI)
}

module.exports = {
  mongoDb,
}
