import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Trash2, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth.store';
import { toast } from 'sonner';

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  const verifiedCode = location.state?.verifiedCode || '';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [formData, setFormData] = useState({ name: '', address: '', entrance: '', floor: '', apartment: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const district = [
      formData.address,
      formData.entrance ? `подъезд ${formData.entrance}` : '',
      formData.floor ? `этаж ${formData.floor}` : '',
      formData.apartment ? `кв. ${formData.apartment}` : '',
    ].filter(Boolean).join(', ');

    try {
      const res = await authApi.register({ phone, code: verifiedCode, name: formData.name, role: 'customer', district });
      setAuth(res.user, res.token, res.refreshToken);
      navigate('/customer');
    } catch (err: any) {
      toast.error(err?.message || 'Ошибка регистрации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate('/select-role')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trash2 className="w-10 h-10 text-gray-900" />
          </div>
          <h1 className="text-2xl text-gray-900 mb-2">Заполните профиль</h1>
          <p className="text-gray-600">Эти данные помогут исполнителям найти вас</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Как к вам обращаться</label>
              <Input
                placeholder="Александр"
                className="h-12 border-gray-200"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Адрес</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="ул. Баумана, 58"
                  className="h-12 border-gray-200 pl-10"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Подъезд</label>
                <Input placeholder="1" className="h-12 border-gray-200" value={formData.entrance} onChange={(e) => setFormData({ ...formData, entrance: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Этаж</label>
                <Input placeholder="5" className="h-12 border-gray-200" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Квартира</label>
                <Input placeholder="42" className="h-12 border-gray-200" value={formData.apartment} onChange={(e) => setFormData({ ...formData, apartment: e.target.value })} />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white mt-8">
            {loading ? 'Регистрируем...' : 'Начать пользоваться'}
          </Button>
        </form>
      </div>
    </div>
  );
}
