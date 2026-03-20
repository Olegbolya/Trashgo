import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
  const role = location.state?.role || 'customer';
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhone(raw);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) return;
    navigate('/verify', { state: { phone: formatPhone(phone), role } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trash2 className="w-10 h-10 text-gray-900" />
            <div>
              <div className="text-2xl font-semibold text-gray-900">Вынос Мусора</div>
              <div className="text-sm text-gray-600">Казань</div>
            </div>
          </div>
          <h1 className="text-2xl text-gray-900 mb-2">Вход или регистрация</h1>
          <p className="text-gray-600">Введите номер телефона</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="mb-6">
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

          <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white">
            Получить код
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Отправим SMS с кодом подтверждения
          </p>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Нажимая "Получить код", вы принимаете условия использования сервиса
        </p>
      </div>
    </div>
  );
}
