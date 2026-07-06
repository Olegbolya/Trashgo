function generateRandom(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export const VKID_APP_ID = import.meta.env.VITE_VKID_APP_ID ?? '';

// Implicit flow: VK returns access_token in hash fragment — no server-side code exchange needed.
// Code exchange (both id.vk.com and oauth.vk.com) fails from Timeweb because id.vk.com is
// network-blocked (404) and oauth.vk.com rejects VK ID codes as "invalid_grant".
export async function startVkOAuth(): Promise<void> {
  if (!VKID_APP_ID) {
    throw new Error('VK не настроен. Добавьте VITE_VKID_APP_ID в переменные окружения.');
  }

  const state = generateRandom(16);
  localStorage.setItem('vkid_state', state);

  const redirect_uri = `${window.location.origin}/auth/vk/callback`;
  const params = new URLSearchParams({
    client_id: VKID_APP_ID,
    redirect_uri,
    response_type: 'token',
    state,
    scope: 'phone email',
    display: 'page',
  });
  window.location.href = `https://oauth.vk.com/authorize?${params}`;
}
