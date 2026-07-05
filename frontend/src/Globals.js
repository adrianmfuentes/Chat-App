// Backend URLs are configurable via environment variables so the same build
// can point at different environments (see .env.example).
export const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

// Derive the WebSocket URL from backendUrl instead of hardcoding ws://localhost,
// so it automatically upgrades to wss:// when the backend is served over https.
export const wsBackendUrl = backendUrl.replace(/^http/, 'ws');
