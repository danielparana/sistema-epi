const API_URL =
              !window.location.hostname ||
               window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://sistema-epi-backend.onrender.com';