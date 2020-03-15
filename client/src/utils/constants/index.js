// require('dotenv').config()
// For successful deployment, add your domain in here (also needed for CI/CD)
const port = process.env.REACT_APP_HOST_PORT || 8080

console.log('ENV variable REACT_APP_HOST: ' + process.env.REACT_APP_HOST)

export const API_HOST =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_HOST
      ? `https://${process.env.REACT_APP_HOST}:${port}`
      : '.'
    : `http://localhost:${port}`
