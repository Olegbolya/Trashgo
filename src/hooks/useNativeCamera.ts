import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNative } from '../lib/platform';

async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return new File([buffer], name, { type: mime });
}

/** On native: opens camera/gallery via Capacitor and returns File[].
 *  On web: returns null — caller should fall back to <input type="file">. */
export async function pickPhotosNative(
  max = 5,
  source: 'camera' | 'gallery' | 'prompt' = 'prompt',
): Promise<File[] | null> {
  if (!isNative()) return null;

  const capSource =
    source === 'camera' ? CameraSource.Camera
    : source === 'gallery' ? CameraSource.Photos
    : CameraSource.Prompt;

  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: capSource,
    });
    if (!photo.dataUrl) return null;
    const file = await dataUrlToFile(photo.dataUrl, `photo_${Date.now()}.jpg`);
    return [file];
  } catch {
    return null;
  }
}
