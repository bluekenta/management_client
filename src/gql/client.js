const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql';

function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

export async function gql(query, variables = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();

  if (!res.ok) {
    if (res.status === 401) clearAuthToken();
    throw new Error(`HTTP ${res.status}`);
  }
  if (json.errors?.length) {
    const msg = json.errors[0].message;
    if (msg === 'Unauthorized' || msg === 'Login required' || (msg && msg.includes('Unauthorized'))) {
      clearAuthToken();
    }
    throw new Error(msg);
  }
  return json.data;
}
