import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Star, MapPin, TrendingUp, CheckCircle, RefreshCw, Zap, Calendar, DollarSign, Award } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function FindContractors() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'available' | 'top-rated'>('all');

  // Mock contractors
  const contractors = [
    {
      id: 1,
      name: 'Иван Петров',
      avatar: '👨',
      rating: 4.9,
      reviews: 127,
      completedOrders: 340,
      distance: '1.2 км от вас',
      price: 45,
      availability: [1, 3, 5], // Mon, Wed, Fri
      availableTime: '16:00-20:00',
      badges: ['⚡ Быстрый', '🏆 Топ-10'],
      responseTime: '5 мин',
      description: 'Опытный исполнитель, работаю с крупногабаритным мусором',
      subscriberCount: 23,
      verified: true,
    },
    {
      id: 2,
      name: 'Алексей Смирнов',
      avatar: '🧑',
      rating: 4.8,
      reviews: 98,
      completedOrders: 245,
      distance: '800 м от вас',
      price: 40,
      availability: [2, 4, 6], // Tue, Thu, Sat
      availableTime: '14:00-18:00',
      badges: ['✅ Проверен', '♻️ Эко'],
      responseTime: '10 мин',
      description: 'Аккуратная работа, пунктуальность',
      subscriberCount: 18,
      verified: true,
    },
    {
      id: 3,
      name: 'Дмитрий Козлов',
      avatar: '👨‍🦱',
      rating: 4.7,
      reviews: 65,
      completedOrders: 156,
      distance: '2.5 км от вас',
      price: 35,
      availability: [1, 2, 3, 4, 5], // Mon-Fri
      availableTime: '10:00-22:00',
      badges: ['🚚 Газель', '💪 Силач'],
      responseTime: '15 мин',
      description: 'Работаю с газелью, вывожу строительный мусор',
      subscriberCount: 12,
      verified: false,
    },
    {
      id: 4,
      name: 'Сергей Волков',
      avatar: '👨‍🦰',
      rating: 5.0,
      reviews: 203,
      completedOrders: 512,
      distance: '3.1 км от вас',
      price: 50,
      availability: [1, 4], // Mon, Thu
      availableTime: '18:00-21:00',
      badges: ['⭐ Лучший', '🏆 Топ-3', '✅ Проверен'],
      responseTime: '2 мин',
      description: 'Профессионал с опытом 3+ лет',
      subscriberCount: 45,
      verified: true,
    },
  ];

  const getDayLabel = (dayId: number) => {
    const labels = ['', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    return labels[dayId];
  };

  const filteredContractors = () => {
    if (filterType === 'top-rated') return contractors.filter(c => c.rating >= 4.8);
    if (filterType === 'available') return contractors.filter(c => c.availability.length >= 3);
    return contractors;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            <h1 className="font-semibold text-gray-900">Найти исполнителя</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 py-5">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5" />
              <span className="font-semibold">Постоянный исполнитель</span>
            </div>
            <div className="text-sm text-purple-100 mb-3">
              Подпишитесь на проверенного исполнителя и экономьте -10₽ на каждом заказе
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Стабильность</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>Скидка -10₽</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Приоритет</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Все ({contractors.length})
            </button>
            <button
              onClick={() => setFilterType('top-rated')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === 'top-rated'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1" />
              Лучшие (4.8+)
            </button>
            <button
              onClick={() => setFilterType('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === 'available'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Доступны часто
            </button>
          </div>
        </div>
      </div>

      {/* Contractors list */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredContractors().map((contractor) => (
            <div 
              key={contractor.id} 
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-400 transition-all"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {contractor.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{contractor.name}</h3>
                      {contractor.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">{contractor.rating}</span>
                        <span className="text-xs text-gray-500">({contractor.reviews})</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {contractor.completedOrders} заказов
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{contractor.distance}</span>
                      <span>•</span>
                      <span>Ответ ~{contractor.responseTime}</span>
                    </div>
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      {contractor.badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-900">{contractor.price}₽</div>
                    <div className="text-xs text-gray-500">за заказ</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{contractor.description}</p>

                {/* Availability */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Доступен</div>
                      <div className="flex items-center gap-1">
                        {contractor.availability.map((dayId) => (
                          <span
                            key={dayId}
                            className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium"
                          >
                            {getDayLabel(dayId)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600 mb-1">Время</div>
                      <div className="text-sm font-medium text-gray-900">{contractor.availableTime}</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-green-600">{contractor.subscriberCount}</div>
                    <div className="text-xs text-gray-600">Подписчиков</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-blue-600">-10₽</div>
                    <div className="text-xs text-gray-600">При подписке</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-white"
                    onClick={() => navigate(`/contractor-profile/${contractor.id}`)}
                  >
                    Профиль
                  </Button>
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => navigate(`/subscribe-contractor/${contractor.id}`)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Подписаться
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="max-w-4xl mx-auto mt-6 bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Как это работает?</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Выберите постоянного исполнителя</li>
                <li>• Договоритесь о днях и времени вывоза</li>
                <li>• Платите на 10₽ меньше за каждый заказ</li>
                <li>• Исполнитель приходит в назначенное время</li>
                <li>• Отменить подписку можно в любой момент</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
