const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3200'
    : '';

export default API_BASE_URL;
