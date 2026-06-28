// Telegram removed — stubs kept so existing imports compile without changes
export const hasTelegram = () => false;
export async function notifyAdmin(message: string): Promise<void> {
  console.log('[ADMIN]', message.replace(/\*/g, '').replace(/\n/g, ' | '));
}
export async function sendTelegramNotification(_chatId: string, _title: string, _body: string): Promise<boolean> { return false; }
export async function sendTelegramOtp(_chatId: string | number, _code: string): Promise<boolean> { return false; }
export async function getBotUsername(): Promise<string | null> { return null; }
