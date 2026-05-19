import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { authApi } from '../../api/auth';
import { useRoleStore } from '../../stores/role.store';
import { toast } from 'sonner';

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '').slice(0, 10);
  let result = '+7';
  if (digits.length > 0) result += ' (' + digits.slice(0, 3);
  if (digits.length >= 4) result += ') ' + digits.slice(3, 6);
  if (digits.length >= 7) result += '-' + digits.slice(6, 8);
  if (digits.length >= 9) result += '-' + digits.slice(8, 10);
  return result;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const pendingRefRole = sessionStorage.getItem('pendingRefRole') as 'customer' | 'contractor' | null;
  const pendingRefCode = sessionStorage.getItem('pendingRefCode');
  const role = (location.state?.role || pendingRefRole || 'customer') as 'customer' | 'contractor';
  const { accentColor, setRole } = useRoleStore();
  const accent = accentColor;
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);

  if (role === 'contractor' || role === 'customer') setRole(role);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, ''));
  };

  const phoneValid = phone.replace(/\D/g, '').length >= 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const formattedPhone = formatPhone(phone);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid || !emailValid || loading) return;
    setLoading(true);
    try {
      const res = await authApi.login(formattedPhone, email.trim());
      navigate('/verify', {
        state: { phone: formattedPhone, role, isNewUser: res.isNewUser, devCode: res.devCode, channel: res.channel, deliveryEmail: res.deliveryEmail || email.trim(), telegramBotLink: res.telegramBotLink },
      });
    } catch {
      toast.error('Ошибка отправки кода. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramSubmit = async () => {
    if (!phoneValid || telegramLoading) return;
    setTelegramLoading(true);
    try {
      const res = await authApi.login(formattedPhone);
      navigate('/verify', {
        state: { phone: formattedPhone, role, isNewUser: res.isNewUser, devCode: res.devCode, channel: res.channel, telegramBotLink: res.telegramBotLink },
      });
    } catch {
      toast.error('Ошибка. Попробуйте ещё раз.');
    } finally {
      setTelegramLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/icon-192.png" alt="TrashGo" style={{ width: 56, height: 56, borderRadius: '1rem', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div className="text-2xl font-semibold text-gray-900">TrashGo</div>
              <div className="text-sm text-gray-600">Вынос мусора, Казань</div>
            </div>
          </div>
          <h1 className="text-2xl text-gray-900 mb-2">Вход или регистрация</h1>
          <p className="text-gray-600">Код подтверждения придёт на почту</p>
        </div>

        {pendingRefCode && (
          <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: `${accent}12`, border: `1.5px solid ${accent}40` }}>
            <span className="text-xl flex-shrink-0">🎁</span>
            <div className="text-left">
              <div className="text-sm font-semibold" style={{ color: accent }}>
                {pendingRefRole === 'contractor' ? 'Вас приглашают как исполнителя' : 'Вас пригласили в TrashGo'}
              </div>
              <div className="text-xs mt-0.5 text-gray-600">
                {pendingRefRole === 'contractor'
                  ? 'Зарегистрируйтесь — выполняйте заказы и зарабатывайте рядом с домом'
                  : 'Зарегистрируйтесь и воспользуйтесь реферальной скидкой'}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Номер телефона</label>
            <Input
              type="tel"
              placeholder="+7 (___) ___-__-__"
              className="h-12 border-gray-200 text-lg"
              value={phone ? formatPhone(phone) : ''}
              onChange={handlePhoneChange}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Email для кода подтверждения</label>
            <Input
              type="email"
              placeholder="your@email.com"
              className="h-12 border-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !phoneValid || !emailValid}
            style={{ background: accent, border: 'none' }}
            className="w-full h-12 text-white hover:opacity-90"
          >
            {loading ? 'Отправляем...' : '📧 Получить код на почту'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Код действителен 10 минут. Проверьте папку «Спам» если не пришёл.
          </p>
        </form>

        {/* Telegram fallback */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <p className="text-sm text-gray-500 mb-3 text-center">Не получили код на почту?</p>
          <Button
            type="button"
            onClick={handleTelegramSubmit}
            disabled={telegramLoading || !phoneValid}
            variant="outline"
            className="w-full h-11"
          >
            {telegramLoading ? 'Отправляем...' : '✈️ Получить код через Telegram-бот'}
          </Button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Введите номер телефона выше и нажмите кнопку
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Нажимая "Получить код", вы принимаете{' '}
          <a href="/privacy" className="underline">политику конфиденциальности</a>
        </p>
      </div>
    </div>
  );
}
