import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.CHAT_GPT_API,
  organization: process.env.CHAT_GPT_ORG,
  defaultHeaders: {
    'OpenAI-Beta': ' assistants=v2',
  },
})
