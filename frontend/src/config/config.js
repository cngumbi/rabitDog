// Use explicit localhost backend during local development, otherwise use same origin in production
export const apiURL = document.location.href.startsWith('http://localhost') ? 'http://localhost:5000' : window.location.origin;
// Alternative: set to a configured production API URL
// export const apiURL = process.env.NODE_ENV === "production" ? "https://api.yourdomain.com" : "http://127.0.0.1:5000";