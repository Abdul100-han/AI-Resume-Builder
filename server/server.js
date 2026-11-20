import app, { ready } from './app.js'

const port = process.env.PORT || 5000

ready()
  .then(() => {
    // Bind IPv4 explicitly. A bare listen() on Windows binds IPv6 only, and the
    // Vite proxy's IPv4 connection is then reset mid-request.
    const server = app.listen(port, '127.0.0.1', () => {
      console.log(`Server running on http://127.0.0.1:${port}`)
    })
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use by another program. Stop it, or set PORT in server/.env `
          + '(and point VITE_API_BASE_URL / the Vite proxy at the new port).')
      } else {
        console.error(error.message)
      }
      process.exit(1)
    })
  })
  .catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
