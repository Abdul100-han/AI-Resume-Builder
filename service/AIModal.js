import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY?.trim()

export const hasGeminiKey = () => Boolean(apiKey)

const getModel = (responseMimeType) => {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      ...(responseMimeType ? { responseMimeType } : {}),
    },
  })
}

export async function generateJson(prompt) {
  const result = await getModel('application/json').generateContent(prompt)
  return JSON.parse(result.response.text())
}

export async function generateText(prompt) {
  const result = await getModel().generateContent(prompt)
  return result.response.text()
}
