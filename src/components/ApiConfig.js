const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3200'
    : 'https://naphex.com';

export default API_BASE_URL;
