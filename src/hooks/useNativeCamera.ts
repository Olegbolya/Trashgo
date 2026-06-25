/** On web, always returns null — caller should use <input type="file">. */
export async function pickPhotosNative(): Promise<File[] | null> {
  return null;
}
