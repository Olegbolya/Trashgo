import { DollarSign, Zap, Lock, Smartphone, Globe, Target } from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: 'Дешево',
    description: 'От 40₽ за мешок — доступные цены для каждого',
    gradient: 'from-[#ffd700] to-[#ffed4e]',
  },
  {
    icon: Zap,
    title: 'Быстро',
    description: 'Среднее время отклика исполнителей — 15 минут',
    gradient: 'from-[#ff4757] to-[#ff6b81]',
  },
  {
    icon: Lock,
    title: 'Безопасно',
    description: 'Все исполнители проходят верификацию и проверку',
    gradient: 'from-[#2ed573] to-[#7bed9f]',
  },
  {
    icon: Smartphone,
    title: 'Удобно',
    description: 'Простой интерфейс для создания заказа за 2 минуты',
    gradient: 'from-[#667eea] to-[#764ba2]',
  },
  {
    icon: Globe,
    title: 'Экологично',
    description: 'Помогаем сделать Казань чище вместе',
    gradient: 'from-[#2ed573] to-[#26de81]',
  },
  {
    icon: Target,
    title: 'P2P модель',
    description: 'Прямое взаимодействие без посредников',
    gradient: 'from-[#764ba2] to-[#667eea]',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#2c3e50] mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Современный сервис, который делает вывоз мусора простым и доступным
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#2c3e50] mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative gradient line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
