const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3200'
    : 'https://www.naphex.com';

export default API_BASE_URL;
