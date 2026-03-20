import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Trash2, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function RegisterContractor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    district: 'Вахитовский',
    transport: 'foot',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь бы сохраняли данные профиля
    navigate('/contractor');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/select-role')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trash2 className="w-10 h-10 text-gray-900" />
          </div>
          <h1 className="text-2xl text-gray-900 mb-2">Заполните профиль</h1>
          <p className="text-gray-600">Эти данные помогут найти заказы рядом с вами</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Как к вам обращаться</label>
              <Input
                placeholder="Дмитрий"
                className="h-12 border-gray-200"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">В каком районе будете работать</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-lg bg-white"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                >
                  <option>Вахитовский</option>
                  <option>Приволжский</option>
                  <option>Советский</option>
                  <option>Ново-Савиновский</option>
                  <option>Московский</option>
                  <option>Авиастроительный</option>
                  <option>Кировский</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Транспорт</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transport: 'foot' })}
                  className={`border-2 rounded-xl p-4 transition-colors ${
                    formData.transport === 'foot'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-900'
                  }`}
                >
                  <div className="text-2xl mb-2">🚶</div>
                  <div className="text-sm font-medium">Пешком</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transport: 'car' })}
                  className={`border-2 rounded-xl p-4 transition-colors ${
                    formData.transport === 'car'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-900'
                  }`}
                >
                  <div className="text-2xl mb-2">🚗</div>
                  <div className="text-sm font-medium">Машина</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transport: 'truck' })}
                  className={`border-2 rounded-xl p-4 transition-colors ${
                    formData.transport === 'truck'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-900'
                  }`}
                >
                  <div className="text-2xl mb-2">🚚</div>
                  <div className="text-sm font-medium">Газель</div>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                💡 Исполнители с транспортом могут брать крупногабаритные заказы по более высокой цене
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white mt-8">
            Начать зарабатывать
          </Button>
        </form>
      </div>
    </div>
  );
}
