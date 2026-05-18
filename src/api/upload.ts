import { api } from './client';

export async function uploadPhoto(file: File, folder = 'orders'): Promise<string> {
  const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:image/...;base64, prefix
      resolve(result.split(',')[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const res = await api.post<{ data: { url: string } }>('/upload', { data: base64, mimeType, folder });
  return res.data.url;
}

/** Falls back to a data URL if the upload endpoint is not configured (503). */
export async function uploadPhotoWithFallback(file: File, folder = 'orders'): Promise<string> {
  try {
    return await uploadPhoto(file, folder);
  } catch (e: any) {
    // 503 = storage not configured; fall back to inline base64 for dev
    if (e?.status === 503 || e?.code === 'NOT_CONFIGURED') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    throw e;
  }
}
