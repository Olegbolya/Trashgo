async function sha256base64url(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem('vkid_device_id');
  if (!id) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    id = `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
    localStorage.setItem('vkid_device_id', id);
  }
  return id;
}

export const VKID_APP_ID = import.meta.env.VITE_VKID_APP_ID ?? '';

// VK ID OAuth 2.1 with PKCE — PUBLIC client (no client_secret).
// Code exchange happens browser-side at id.vk.com — bypasses Timeweb IP block entirely.
// access_token + id_token sent to backend; id_token JWT contains unmasked phone claim.
export async function startVkOAuth(): Promise<void> {
  if (!VKID_APP_ID) {
    throw new Error('VK не настроен. Добавьте VITE_VKID_APP_ID в переменные окружения.');
  }

  const verifier = randomString(64);
  const challenge = await sha256base64url(verifier);
  const state = randomString(16);
  const deviceId = getOrCreateDeviceId();

  sessionStorage.setItem('vkid_verifier', verifier);
  sessionStorage.setItem('vkid_state', state);

  const redirect_uri = `${window.location.origin}/auth/vk/callback`;
  const params = new URLSearchParams({
    client_id: VKID_APP_ID,
    redirect_uri,
    response_type: 'code',
    scope: 'phone email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    device_id: deviceId,
  });
  window.location.href = `https://id.vk.com/authorize?${params}`;
}
