import { MapPin, Clock, Package } from 'lucide-react';

const orders = [
  {
    id: 1,
    address: 'ул. Баумана, 58',
    time: '15 мин назад',
    volume: '3-5 мешков',
    price: '50₽',
    responses: 3,
  },
  {
    id: 2,
    address: 'пр. Победы, 120',
    time: '42 мин назад',
    volume: '1-2 мешка',
    price: '40₽',
    responses: 7,
  },
  {
    id: 3,
    address: 'ул. Чистопольская, 34',
    time: '1 час назад',
    volume: 'Крупногабаритный',
    price: '150₽',
    responses: 2,
  },
  {
    id: 4,
    address: 'ул. Гаврилова, 12',
    time: '2 часа назад',
    volume: '3-5 мешков',
    price: '60₽',
    responses: 5,
  },
];

export function RecentOrders() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl text-gray-900 mb-1">Активные заказы</h2>
            <p className="text-sm text-gray-600">Последние запросы от жителей Казани</p>
          </div>

          {/* Orders list */}
          <div className="grid md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{order.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{order.price}</div>
                    <div className="text-xs text-gray-500">{order.responses} откликов</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {order.volume}
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Обновляется в реальном времени • Среднее время отклика 15 минут
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
