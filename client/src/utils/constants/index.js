// Deployment: paste your domain in here (also needed for CI/CD)
export const API_HOST =
  process.env.NODE_ENV === 'production'
    ? 'https://aggregator.cleverapps.io'
    : 'http://localhost:8081'
