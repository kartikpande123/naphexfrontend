const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3200/api'
    : 'https://naphex.com/api';


export default API_BASE_URL;
