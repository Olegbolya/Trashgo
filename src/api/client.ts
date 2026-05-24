// In native Capacitor builds there is no relative-URL server, so we always need
// the absolute Railway URL. VITE_API_URL is set in Vercel env for web and in
// .env.production for Android/iOS builds.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://api-production-8470.up.railway.app/api/v1'
    : 'http://localhost:3000/api/v1');

class ApiClient {
  private baseUrl: string;
  private refreshing: Promise<string | null> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.state?.token ?? null;
    } catch {
      return null;
    }
  }

  private getRefreshToken(): string | null {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.state?.refreshToken ?? null;
    } catch {
      return null;
    }
  }

  private async doRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        // Only clear auth on explicit auth rejection (401/403), not server errors
        if (res.status === 401 || res.status === 403) {
          this.clearAuth();
        }
        return null;
      }

      const body = await res.json();
      const { token, refreshToken: newRefreshToken } = body.data;

      // Persist new tokens into localStorage so zustand picks them up
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state) {
          parsed.state.token = token;
          parsed.state.refreshToken = newRefreshToken;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }
      }

      return token;
    } catch {
      // Network error — don't clear auth, let the original request fail gracefully
      return null;
    }
  }

  private clearAuth() {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.state) {
        parsed.state.token = null;
        parsed.state.refreshToken = null;
        parsed.state.isAuthenticated = false;
        parsed.state.user = null;
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
    } catch {}
    // Force page reload to go back to login
    window.location.href = '/';
  }

  private async request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

    // On 401, try to refresh once (but not for auth endpoints to avoid loops)
    if (response.status === 401 && !isRetry && !path.startsWith('/auth/')) {
      // Deduplicate concurrent refresh calls
      if (!this.refreshing) {
        this.refreshing = this.doRefresh().finally(() => { this.refreshing = null; });
      }
      const newToken = await this.refreshing;
      if (newToken) {
        return this.request<T>(path, options, true);
      }
      // doRefresh already cleared auth + redirected
      return undefined as T;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message =
        body?.error?.message ||
        body?.message ||
        `HTTP ${response.status}`;
      const code = body?.error?.code || body?.code || 'UNKNOWN';
      throw { code, message };
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);
