function base64urlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlEncode(digest);
}

function generateRandom(length = 43): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export const VKID_APP_ID = import.meta.env.VITE_VKID_APP_ID ?? '';

export async function startVkOAuth() {
  if (!VKID_APP_ID) {
    console.error('[VKID] VITE_VKID_APP_ID not set');
    return;
  }
  const code_verifier = generateRandom(43);
  const code_challenge = await generateCodeChallenge(code_verifier);
  const state = generateRandom(16);

  sessionStorage.setItem('vkid_code_verifier', code_verifier);
  sessionStorage.setItem('vkid_state', state);

  const redirect_uri = `${window.location.origin}/auth/vk/callback`;
  const params = new URLSearchParams({
    client_id: VKID_APP_ID,
    redirect_uri,
    response_type: 'code',
    state,
    scope: 'phone',
    code_challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `https://id.vk.com/oauth2/authorize?${params}`;
}
