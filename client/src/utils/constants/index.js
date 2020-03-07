// require('dotenv').config()
// For successful deployment, add your domain in here (also needed for CI/CD)
const port = process.env.REACT_APP_PORT || 80

console.log(
  'Passed ENV variable: REACT_APP_HOST_IP: ' + process.env.REACT_APP_HOST_IP
)

export const API_HOST =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_HOST_IP
      ? `http://${process.env.REACT_APP_HOST_IP}:${port}`
      : '.'
    : `http://localhost:${port}`
