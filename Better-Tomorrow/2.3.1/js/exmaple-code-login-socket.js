// Disable certificate-host matching verification
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const socketio = require('socket.io-client')
const axios = require('axios')
const instance = axios.create({ baseURL: 'https://kong.tls.ai/bt/api' })
async function _login(username = '<USerName>', password = '<Password>') {
  return instance.post('/login', { username, password })
}
async function _confirmEula(username, password) {
  return instance.post('/eula', { username, password })
}
async function getToken(username, password) {
  const { data: { token, isEulaConfirmed } } = await _login(username, password)
  if (!isEulaConfirmed) {
    await _confirmEula(username, password)
    return getToken(username, password)
  }
  return token
}
async function connectToSocket() {
  const token = await getToken()
  const socket = await socketio('https://kong.tls.ai', {
    rejectUnauthorized: false,
    path: '/bt/api/socket.io',
    transports: ['websocket'],
    query: {
      token
    }
  })
  // Error events
  const errSocket = ['connect_error', 'connect_timeout', 'reconnect_error', 'reconnect_failed', 'error', 'disconnect']
  errSocket.forEach(e => socket.on(e, err => console.error(`Error: ${e}`, err)))
  socket.on('connect', () => {
    console.log('connected to socket!')
  })
  socket.on('track:created', track => {
    console.log('Got track -', track)
  })
}
connectToSocket()
  .then().catch(console.error)