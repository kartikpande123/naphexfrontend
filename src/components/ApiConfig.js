const API_BASE_URL =

  process.env.NODE_ENV === 'development'

    ? 'http://localhost:3200'

    : ''; // Empty string for production - uses same origin

export default API_BASE_URL; 