import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth.store';
import { useRoleStore } from '../../stores/role.store';
import { toast } from 'sonner';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  const role = location.state?.role || 'customer';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accent = useRoleStore((s) => s.accentColor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.verify(phone, code);

      if (res.isNewUser) {
        navigate('/select-role', { state: { phone, verifiedCode: code } });
        return;
      }

      setAuth(res.user, res.token, res.refreshToken);
      navigate(res.user.role === 'contractor' ? '/contractor' : '/customer');
    } catch (err: any) {
      const msg = err?.message || 'Неверный или истёкший код';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await authApi.login(phone);
      if (res.devCode) {
        toast.info(`Новый код: ${res.devCode}`, { duration: 30000 });
      } else {
        toast.success('Код отправлен повторно');
      }
    } catch {
      toast.error('Ошибка. Попробуйте позже.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trash2 className="w-10 h-10 text-gray-900" />
            <div>
              <div className="text-2xl font-semibold text-gray-900">Вынос Мусора</div>
              <div className="text-sm text-gray-600">Казань</div>
            </div>
          </div>
          <h1 className="text-2xl text-gray-900 mb-2">Введите код</h1>
          <p className="text-gray-600">
            Отправили SMS на номер {phone}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-2 block">Код из SMS</label>
            <Input
              type="text"
              placeholder="••••"
              className="h-12 border-gray-200 text-center text-2xl tracking-widest"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || code.length < 4}
            style={{ background: accent, border: 'none' }}
            className="w-full h-12 text-white hover:opacity-90"
          >
            {loading ? 'Проверяем...' : 'Подтвердить'}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            className="w-full text-sm text-gray-600 hover:text-gray-900 mt-4"
          >
            Отправить код повторно
          </button>
        </form>
      </div>
    </div>
  );
}
