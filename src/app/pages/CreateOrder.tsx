import { useLocation, useNavigate } from 'react-router';
import { CheckCircle, MapPin, Calendar, Clock, Package, Coins, ArrowLeft, Edit2, Zap, Star, Trophy, Sparkles, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state || {
    address: '',
    date: '',
    time: '',
    volume: 1,
    price: 50
  };

  // Editable state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    toast.success('🎉 Заказ создан!', {
      description: '🎁 Получено +50 XP • До нового уровня 200 XP',
      duration: 4000,
    });
    
    setTimeout(() => {
      navigate('/order-confirmed');
    }, 1500);
  };

  const handleEdit = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const basePrice = formData.price || 50;
  const xpReward = 50;
  const potentialDiscount = 10;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/customer')}
              className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">Создание заказа</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Order details card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Детали заказа</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                {isEditing ? 'Сохранить' : 'Изменить'}
              </Button>
            </div>

            <div className="p-5 space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">Адрес вывоза</div>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => handleEdit('address', e.target.value)}
                      className="font-medium"
                    />
                  ) : (
                    <div className="font-medium text-gray-900">{formData.address}</div>
                  )}
                </div>
              </div>

              {/* Date and Time */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Дата</div>
                    {isEditing ? (
                      <Input
                        value={formData.date}
                        onChange={(e) => handleEdit('date', e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{formData.date}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Время</div>
                    {isEditing ? (
                      <Input
                        value={formData.time}
                        onChange={(e) => handleEdit('time', e.target.value)}
                        className="font-medium"
                        type="time"
                      />
                    ) : (
                      <div className="font-medium text-gray-900">{formData.time}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">Объем мусора</div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.volume}
                        onChange={(e) => handleEdit('volume', parseInt(e.target.value))}
                        className="font-medium w-24"
                      />
                      <span className="text-gray-600">мешков</span>
                    </div>
                  ) : (
                    <div className="font-medium text-gray-900">{formData.volume} мешков</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Средний мешок = 30-40 литров
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Coins className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">Ваша цена</div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleEdit('price', parseInt(e.target.value))}
                        className="font-medium w-32 text-xl"
                      />
                      <span className="text-gray-600 font-medium">₽</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-green-600">{formData.price} ₽</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Рекомендуемая цена: {basePrice}₽ • Средняя по району: {basePrice + 5}₽
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold text-gray-900">Дополнительная информация</h2>
              <span className="text-xs text-gray-500">(необязательно)</span>
            </div>
            <Textarea
              placeholder="Например: код домофона 123К, этаж 5, мусор уже на площадке..."
              className="min-h-[100px] resize-none border-gray-200 focus:border-purple-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="text-xs text-gray-500 mt-2">
              💡 Чем больше деталей - тем быстрее найдется исполнитель!
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => navigate('/customer')}
            >
              Отменить
            </Button>
            <Button
              className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              onClick={handleConfirm}
            >
              Опубликовать заказ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
