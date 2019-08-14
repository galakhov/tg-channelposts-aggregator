// For successful deployment, add your domain in here (also needed for CI/CD)
// production
const port = process.env.PORT || 8080
export const API_HOST =
  process.env.NODE_ENV === 'production'
    ? `https://aggregator.cleverapps.io`
    : `http://localhost:${port}`
