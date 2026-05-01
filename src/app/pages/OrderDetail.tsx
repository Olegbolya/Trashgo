import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MapPin, Clock, Package, ArrowLeft, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { ordersApi } from '../../api/orders';
import type { Order } from '../../types/order';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    ordersApi
      .getById(id)
      .then((res) => {
        const data = (res as unknown as { data: Order }).data ?? (res as unknown as Order);
        setOrder(data);
      })
      .catch(() => toast.error('Не удалось загрузить заказ'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRespond = () => {
    toast.success('Отклик отправлен!', { description: 'Ожидайте ответа заказчика' });
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Заказ не найден</div>
      </div>
    );
  }

  const scheduledDate = order.asap
    ? '⚡ Как можно скорее'
    : order.scheduledAt
      ? new Date(order.scheduledAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
      : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>

          {/* Order info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Заказ #{order.id.slice(0, 8)}</div>
                <h1 className="text-xl text-gray-900">Вынос мусора</h1>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-900">{order.price}₽</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-600 mb-1">Адрес</div>
                  <div className="text-gray-900">{order.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-600 mb-1">Дата и время</div>
                  <div className="text-gray-900">{scheduledDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-600 mb-1">Объем</div>
                  <div className="text-gray-900">{order.volume} мешков</div>
                </div>
              </div>

              {order.description && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">Описание</div>
                  <p className="text-gray-900">{order.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {order.customerName || 'Заказчик'}
                </div>
                <div className="text-sm text-gray-500">Заказчик</div>
              </div>
            </div>
          </div>

          {/* Response form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg text-gray-900 mb-4">Откликнуться на заказ</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Ваша цена</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="60"
                    className="h-12 border-gray-200"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <span className="text-gray-600">₽</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Клиент готов заплатить {order.price}₽
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Сообщение клиенту (необязательно)
                </label>
                <Textarea
                  placeholder="Например: Могу приехать раньше..."
                  className="min-h-[100px] resize-none border-gray-200"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white"
                onClick={handleRespond}
              >
                Отправить предложение
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Клиент получит уведомление о вашем предложении
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
