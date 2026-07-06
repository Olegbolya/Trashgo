async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generateRandom(length = 43): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export const VKID_APP_ID = import.meta.env.VITE_VKID_APP_ID ?? '';

// VK ID OAuth 2.1 PKCE flow.
// id.vk.com/authorize → code in callback URL → browser POSTs to id.vk.com/oauth2/token
// Token exchange runs in USER'S BROWSER, not on Timeweb server.
// Timeweb's IP has id.vk.com blocked at network level; the browser is unaffected.
export async function startVkOAuth(): Promise<void> {
  if (!VKID_APP_ID) {
    throw new Error('VK не настроен. Добавьте VITE_VKID_APP_ID в переменные окружения.');
  }

  const state = generateRandom(16);
  const codeVerifier = generateRandom(43);
  const codeChallenge = await sha256Base64Url(codeVerifier);

  localStorage.setItem('vkid_state', state);
  localStorage.setItem('vkid_code_verifier', codeVerifier);

  const redirect_uri = `${window.location.origin}/auth/vk/callback`;
  const params = new URLSearchParams({
    client_id: VKID_APP_ID,
    redirect_uri,
    response_type: 'code',
    state,
    scope: 'phone email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  window.location.href = `https://id.vk.com/authorize?${params}`;
}
