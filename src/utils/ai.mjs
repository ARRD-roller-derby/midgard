import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.CHAT_GPT_API,
})
