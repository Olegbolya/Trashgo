import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { authApi } from '../../api/auth';
import { useRoleStore } from '../../stores/role.store';
import { toast } from 'sonner';
import { isNative } from '../../lib/platform';

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

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'email' | 'phone' | 'tg'>('email');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'contractor' || role === 'customer') setRole(role);
  }, [role, setRole]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length >= 10;
  const formattedPhone = phone ? formatPhone(phone) : '';

  // Step 1: submit email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || loading) return;
    setLoading(true);
    try {
      const res = await authApi.login(email.trim());
      if (res.needsPhone) {
        setStep('phone');
        return;
      }
      navigate('/verify', {
        state: {
          email: email.trim(),
          role,
          isNewUser: res.isNewUser,
          devCode: res.devCode,
          channel: res.channel,
          deliveryEmail: res.deliveryEmail || email.trim(),
          telegramBotLink: res.telegramBotLink,
        },
      });
    } catch {
      toast.error('Ошибка. Проверьте email и попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: email + phone (new user registration)
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid || loading) return;
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), formattedPhone);
      navigate('/verify', {
        state: {
          email: email.trim(),
          phone: formattedPhone,
          role,
          isNewUser: true,
          devCode: res.devCode,
          channel: res.channel,
          deliveryEmail: res.deliveryEmail || email.trim(),
          telegramBotLink: res.telegramBotLink,
        },
      });
    } catch {
      toast.error('Ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  // TG phone-only login
  const handleTgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid || loading) return;
    setLoading(true);
    try {
      const res = await authApi.requestTelegram(formattedPhone);
      navigate('/verify', {
        state: {
          phone: formattedPhone,
          role,
          isNewUser: false,
          channel: 'telegram',
          telegramBotLink: res.telegramBotLink,
        },
      });
    } catch {
      toast.error('Не удалось отправить код. Проверьте номер и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => (step === 'phone' || step === 'tg') ? setStep('email') : navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
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
          <p className="text-gray-600 text-sm">
            {step === 'email'
              ? 'Код подтверждения придёт на почту'
              : step === 'tg'
              ? 'Введите номер — получите код в Telegram'
              : 'Укажите номер для связи (не публикуется)'}
          </p>
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

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Email <span className="text-red-500">*</span></label>
              <Input
                type="email"
                inputMode="email"
                placeholder="your@email.com"
                className="h-12 border-gray-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={!isNative()}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !emailValid}
              style={{ background: accent, border: 'none' }}
              className="w-full h-12 text-white hover:opacity-90"
            >
              {loading ? 'Проверяем...' : '📧 Продолжить'}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setPhone(''); setStep('tg'); }}
                className="text-sm font-medium underline-offset-2 hover:underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2AABEE' }}
              >
                🔵 Войти по номеру телефона (Telegram)
              </button>
            </div>
          </form>
        ) : step === 'tg' ? (
          <form onSubmit={handleTgSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Номер телефона <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="+7 (___) ___-__-__"
                className="h-12 border-gray-200 text-lg"
                value={phone ? formatPhone(phone) : ''}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                autoFocus={!isNative()}
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Код придёт в Telegram-бот TrashGo
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !phoneValid}
              className="w-full h-12 text-white hover:opacity-90"
              style={{ background: '#2AABEE', border: 'none' }}
            >
              {loading ? 'Отправляем...' : '🔵 Получить код в Telegram'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePhoneSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 space-y-4">
            <div className="rounded-xl p-3 bg-gray-50 text-sm text-gray-600 flex items-center gap-2">
              <span>📧</span>
              <span className="font-medium text-gray-900">{email}</span>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Номер телефона <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="+7 (___) ___-__-__"
                className="h-12 border-gray-200 text-lg"
                value={phone ? formatPhone(phone) : ''}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                autoFocus={!isNative()}
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Нужен заказчику / исполнителю для связи. Не передаётся третьим лицам.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !phoneValid}
              style={{ background: accent, border: 'none' }}
              className="w-full h-12 text-white hover:opacity-90"
            >
              {loading ? 'Отправляем...' : '📧 Получить код на почту'}
            </Button>
          </form>
        )}

        <p className="text-xs text-gray-500 text-center">
          Нажимая "Продолжить", вы принимаете{' '}
          <a href="/privacy" className="underline">политику конфиденциальности</a>
        </p>
      </div>
    </div>
  );
}
