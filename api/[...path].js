import app, { ready } from '../server/app.js'

// Vercel runs this for every /api/* request. The Express routes keep their /api prefix.
export default async function handler(req, res) {
  try {
    await ready()
  } catch (error) {
    res.status(500).json({ message: error.message })
    return
  }
  return app(req, res)
}
