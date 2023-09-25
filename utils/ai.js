const OpenAI = require('openai')
const { CHAT_GPT_API } = require('./constants')

const openai = new OpenAI({
  apiKey: CHAT_GPT_API,
})

module.exports = {
  openai,
}
