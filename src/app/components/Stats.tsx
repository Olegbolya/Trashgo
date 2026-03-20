import { Trophy, TrendingUp, Users } from 'lucide-react';

const stats = [
  {
    icon: Trophy,
    value: '1-й',
    label: 'в регионе',
    description: 'Первый P2P сервис выноса мусора в Татарстане',
  },
  {
    icon: TrendingUp,
    value: '0',
    label: 'конкурентов',
    description: 'Уникальная бизнес-модель на рынке',
  },
  {
    icon: Users,
    value: '1.2М',
    label: 'потенциальных клиентов',
    description: 'Население Казани',
  },
];

export function Stats() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#2c3e50] to-[#34495e] text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-64 h-64 bg-[#667eea] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-[#2ed573] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            Мы — пионеры рынка
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Создаем новую индустрию персональных услуг в Казани
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#ffd700] to-[#ffed4e] shadow-xl">
                  <stat.icon className="w-8 h-8 text-[#2c3e50]" />
                </div>
              </div>

              {/* Value */}
              <div className="mb-2">
                <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#ffd700] to-[#ffed4e] bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>

              {/* Label */}
              <div className="text-xl font-semibold mb-3">
                {stat.label}
              </div>

              {/* Description */}
              <p className="text-white/70 leading-relaxed">
                {stat.description}
              </p>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#ffd700]/20 to-transparent rounded-tr-3xl"></div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-16">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full border border-white/20">
            <p className="text-lg">
              <span className="font-bold text-[#ffd700]">Присоединяйтесь</span> к революции в сфере бытовых услуг
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
