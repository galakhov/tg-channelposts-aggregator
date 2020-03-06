require('dotenv').config()
// For successful deployment, add your domain in here (also needed for CI/CD)
const port = process.env.PORT || 8080

console.log('process.env.SERVER_IP', process.env.REACT_APP_SERVER_IP)

export const API_HOST =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_SERVER_IP
      ? `http://${process.env.REACT_APP_SERVER_IP}:${port}`
      : '.'
    : `http://localhost:${port}`
