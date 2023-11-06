require('dotenv').config()

const {
  OPENAPI_TOKEN,
  OPENAPI_URL,
  OPENAI_KEY,
} = process.env

export const globalConfig = {
  openapi: {
    token: OPENAPI_TOKEN,
    url: OPENAPI_URL,
  },
  openai: {
    apiKey: OPENAI_KEY,
  }
}