function generateRandom(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export const VKID_APP_ID = import.meta.env.VITE_VKID_APP_ID ?? '';

// Classic VK OAuth via oauth.vk.com — codes exchange at oauth.vk.com/access_token (no IP block).
// Requires a classic "Веб-сайт" app, NOT a VK ID confidential app:
//   - id.vk.com/oauth2/token is blocked from Timeweb
//   - VK ID apps issue codes only exchangeable at id.vk.com
//   - implicit flow (response_type=token) is blocked for confidential apps
export async function startVkOAuth(): Promise<void> {
  if (!VKID_APP_ID) {
    throw new Error('VK не настроен. Добавьте VITE_VKID_APP_ID в переменные окружения.');
  }

  const state = generateRandom(16);
  localStorage.setItem('vkid_state', state);

  const redirect_uri = `${window.location.origin}/auth/vk/callback`;
  const params = new URLSearchParams({
    client_id: VKID_APP_ID,
    display: 'page',
    redirect_uri,
    scope: 'phone,email',
    response_type: 'code',
    state,
  });
  window.location.href = `https://oauth.vk.com/authorize?${params}`;
}
