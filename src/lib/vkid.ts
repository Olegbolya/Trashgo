function generateRandom(length = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

async function computeCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export const VKID_APP_ID = import.meta.env.VITE_VKID_APP_ID ?? '';
export const VKID_CLIENT_SECRET = import.meta.env.VITE_VKID_CLIENT_SECRET ?? '';

export async function startVkOAuth(): Promise<void> {
  if (!VKID_APP_ID) {
    throw new Error('VK не настроен. Добавьте VITE_VKID_APP_ID в переменные окружения.');
  }

  const state = generateRandom(16);
  const code_verifier = generateRandom(64);
  const code_challenge = await computeCodeChallenge(code_verifier);

  // device_id is intentionally omitted: the token exchange falls back to oauth.vk.com/access_token
  // (id.vk.com/oauth2/token is inaccessible server-side). oauth.vk.com rejects device_id as an
  // unknown param, so if the code is bound to a device_id the exchange fails with "Code is invalid".
  localStorage.setItem('vkid_state', state);
  localStorage.setItem('vkid_code_verifier', code_verifier);

  const redirect_uri = `${window.location.origin}/auth/vk/callback`;
  const params = new URLSearchParams({
    client_id: VKID_APP_ID,
    redirect_uri,
    response_type: 'code',
    state,
    scope: 'phone email',
    code_challenge,
    code_challenge_method: 'S256',
  });
  window.location.href = `https://id.vk.com/authorize?${params}`;
}
