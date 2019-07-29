// Deployment: paste your domain in here (also needed for CI/CD)
export const API_HOST =
  process.env.NODE_ENV === 'production'
    ? 'http://todo.com'
    : 'http://localhost:8081'
