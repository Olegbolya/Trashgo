function generateRandom(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export const VKID_APP_ID = import.meta.env.VITE_VKID_APP_ID ?? '';

export function startVkOAuth() {
  if (!VKID_APP_ID) {
    throw new Error('VK не настроен. Добавьте VITE_VKID_APP_ID в переменные окружения.');
  }
  const state = generateRandom(16);
  sessionStorage.setItem('vkid_state', state);

  const redirect_uri = `${window.location.origin}/auth/vk/callback`;
  const params = new URLSearchParams({
    client_id: VKID_APP_ID,
    redirect_uri,
    response_type: 'code',
    state,
    scope: 'phone,email',
    display: 'page',
  });
  window.location.href = `https://oauth.vk.com/authorize?${params}`;
}
