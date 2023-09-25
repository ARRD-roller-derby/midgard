const OpenAI = require('openai')
const { CHAT_GPT_API, CHAT_GPT_ORG_ID } = require('./constants')

const openai = new OpenAI({
  apiKey: CHAT_GPT_API,
})

module.exports = {
  openai,
}
