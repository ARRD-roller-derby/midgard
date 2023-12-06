const { Schema, model, models } = require('mongoose')
const NewsSchema = new Schema({
  url: String,
  created_at: Date,
})

module.exports = {
  News: models.news || model('news', NewsSchema),
}
