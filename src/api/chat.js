/**
 * Base URL for REST API (same origin as GraphQL when VITE_GRAPHQL_URL is set).
 */
function getApiBase() {
  const gqlUrl = import.meta.env.VITE_GRAPHQL_URL;
  if (gqlUrl) {
    try {
      return new URL(gqlUrl).origin;
    } catch {
      return '';
    }
  }
  return '';
}

export async function sendChatMessage(message, history = []) {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${getApiBase()}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, history }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || `HTTP ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return data.reply;
}
