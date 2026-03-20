import { MapPin, Users, Clock } from 'lucide-react';

const districts = [
  {
    name: 'Вахитовский',
    workers: 45,
    avgResponse: '12 мин',
    status: 'active',
  },
  {
    name: 'Приволжский',
    workers: 38,
    avgResponse: '15 мин',
    status: 'active',
  },
  {
    name: 'Советский',
    workers: 52,
    avgResponse: '10 мин',
    status: 'active',
  },
  {
    name: 'Ново-Савиновский',
    workers: 31,
    avgResponse: '18 мин',
    status: 'active',
  },
  {
    name: 'Московский',
    workers: 28,
    avgResponse: '20 мин',
    status: 'active',
  },
  {
    name: 'Кировский',
    workers: 0,
    avgResponse: '—',
    status: 'coming-soon',
  },
  {
    name: 'Авиастроительный',
    workers: 0,
    avgResponse: '—',
    status: 'coming-soon',
  },
];

export function Districts() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#2c3e50] mb-4">
            Районы обслуживания
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Работаем в центральных районах Казани, расширяем покрытие каждый месяц
          </p>
        </div>

        {/* Map illustration */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 rounded-3xl p-12 border-2 border-[#667eea]/20">
            {/* Decorative map */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                <path d="M50,50 Q100,30 150,60 T250,80 Q300,100 350,70" stroke="currentColor" strokeWidth="2"/>
                <path d="M30,150 Q80,130 130,160 T230,180 Q280,200 330,170" stroke="currentColor" strokeWidth="2"/>
                <circle cx="150" cy="100" r="40" fill="currentColor" opacity="0.3"/>
                <circle cx="250" cy="150" r="50" fill="currentColor" opacity="0.3"/>
              </svg>
            </div>

            {/* Center text */}
            <div className="relative text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-[#667eea]" />
              <h3 className="text-2xl font-bold text-[#2c3e50] mb-2">Казань</h3>
              <p className="text-gray-600">5 районов активны • 2 скоро откроются</p>
            </div>
          </div>
        </div>

        {/* Districts grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {districts.map((district, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                district.status === 'active'
                  ? 'bg-white border-[#2ed573] hover:shadow-lg hover:-translate-y-1'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Status badge */}
              <div className="absolute -top-3 -right-3">
                {district.status === 'active' ? (
                  <div className="bg-[#2ed573] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Активно
                  </div>
                ) : (
                  <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Скоро
                  </div>
                )}
              </div>

              {/* District name */}
              <h4 className="text-lg font-bold text-[#2c3e50] mb-4">
                {district.name}
              </h4>

              {/* Stats */}
              {district.status === 'active' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-[#667eea]" />
                    <span>{district.workers} исполнителей</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-[#ff4757]" />
                    <span>Ср. отклик: {district.avgResponse}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Регистрируйтесь в список ожидания
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Coverage note */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Не нашли свой район?{' '}
            <button className="text-[#667eea] font-semibold hover:underline">
              Оставьте заявку
            </button>
            {' '}и мы сообщим о запуске
          </p>
        </div>
      </div>
    </section>
  );
}
