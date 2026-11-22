import app, { ready } from '../server/app.js'

// Vercel serverless entry. vercel.json rewrites every /api/* request here so
// nested routes such as /api/auth/login still reach Express.
export default async function handler(req, res) {
  try {
    await ready()
  } catch (error) {
    res.status(500).json({ message: error.message })
    return
  }
  return app(req, res)
}
