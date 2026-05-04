import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, DollarSign, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { subscriptionsApi } from '../../api/subscriptions';
import { toast } from 'sonner';

export default function CreateSubscription() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [time, setTime] = useState('18:00');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('50');
  const [description, setDescription] = useState('');

  const weekDays = [
    { id: 1, label: 'ПН', full: 'Понедельник' },
    { id: 2, label: 'ВТ', full: 'Вторник' },
    { id: 3, label: 'СР', full: 'Среда' },
    { id: 4, label: 'ЧТ', full: 'Четверг' },
    { id: 5, label: 'ПТ', full: 'Пятница' },
    { id: 6, label: 'СБ', full: 'Суббота' },
    { id: 7, label: 'ВС', full: 'Воскресенье' },
  ];

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await subscriptionsApi.create({
        address,
        days: selectedDays,
        time,
        price: Number(price),
        description,
      });
      toast.success('Расписание создано');
      navigate('/my-subscriptions');
    } catch {
      toast.error('Не удалось создать расписание');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="font-semibold text-gray-900">График вывоза</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Days */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Выберите дни недели
                </h2>
                <p className="text-gray-600">
                  В какие дни вам нужен вывоз мусора?
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-3">
                  {weekDays.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedDays.includes(day.id)
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm mb-1">{day.label}</div>
                      <div className="text-xs opacity-70">{day.full}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDays.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-sm text-blue-900">
                    Выбрано дней: {selectedDays.length}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {selectedDays.map(id => weekDays.find(d => d.id === id)?.label).join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Time */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Выберите время
                </h2>
                <p className="text-gray-600">
                  Во сколько исполнитель должен приехать?
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-900">
                    Время вывоза
                  </label>
                </div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-3xl font-semibold text-gray-900 bg-gray-50 rounded-xl p-4 border border-gray-200 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Популярное время</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['08:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`py-3 px-4 rounded-lg border transition-colors ${
                        time === t
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Укажите адрес
                </h2>
                <p className="text-gray-600">
                  Откуда забирать мусор?
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-900">
                    Адрес
                  </label>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ул. Баумана, 58"
                  className="w-full text-lg text-gray-900 bg-gray-50 rounded-xl p-4 border border-gray-200 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <label className="text-sm font-medium text-gray-900">
                    Описание (необязательно)
                  </label>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Например: подъезд 2, домофон 58"
                  rows={3}
                  className="w-full text-gray-900 bg-gray-50 rounded-xl p-4 border border-gray-200 focus:outline-none focus:border-gray-900 resize-none"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Недавние адреса</h3>
                <div className="space-y-2">
                  {['ул. Баумана, 58', 'пр. Победы, 120', 'ул. Пушкина, 23'].map((addr) => (
                    <button
                      key={addr}
                      onClick={() => setAddress(addr)}
                      className="w-full text-left py-3 px-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{addr}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Price & Summary */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Цена за вывоз
                </h2>
                <p className="text-gray-600">
                  Сколько готовы платить за один вывоз?
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-900">
                    Цена за раз
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50"
                    className="flex-1 text-3xl font-semibold text-gray-900 bg-gray-50 rounded-xl p-4 border border-gray-200 focus:outline-none focus:border-gray-900"
                  />
                  <span className="text-2xl font-semibold text-gray-900">₽</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Рекомендуемая цена</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['40', '50', '60', '70', '80', '100'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPrice(p)}
                      className={`py-3 px-4 rounded-lg border transition-colors ${
                        price === p
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      {p}₽
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Сводка подписки</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Дней в неделю:</span>
                    <span className="font-semibold">{selectedDays.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Время:</span>
                    <span className="font-semibold">{time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Адрес:</span>
                    <span className="font-semibold text-right">{address || 'Не указан'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Цена за раз:</span>
                    <span className="font-semibold">{price}₽</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">В неделю:</span>
                      <span className="text-2xl font-bold">{selectedDays.length * Number(price)}₽</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-300">В месяц (~4 недели):</span>
                      <span className="text-xl font-semibold">{selectedDays.length * Number(price) * 4}₽</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <div className="font-medium mb-1">Бонус за регулярность</div>
                    <div className="text-green-700">
                      Исполнители платят на 10₽ больше за постоянных клиентов. 
                      Вы получите более стабильный сервис.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Назад
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && selectedDays.length === 0) ||
                  (step === 3 && !address)
                }
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Далее
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!address || !price || submitting}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Создание...' : 'Создать подписку'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
