import { FileEdit, Users, CheckCircle, Star } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: FileEdit,
    title: 'Создайте заказ',
    description: 'Опишите, что нужно вывезти, укажите адрес и удобное время',
    color: 'from-[#667eea] to-[#764ba2]',
  },
  {
    number: '02',
    icon: Users,
    title: 'Выберите исполнителя',
    description: 'Получите предложения от проверенных работников с ценами',
    color: 'from-[#ff4757] to-[#ff6b81]',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Работа выполнена',
    description: 'Исполнитель приходит вовремя и вывозит ваш мусор',
    color: 'from-[#2ed573] to-[#7bed9f]',
  },
  {
    number: '04',
    icon: Star,
    title: 'Оставьте отзыв',
    description: 'Оцените работу и помогите другим сделать правильный выбор',
    color: 'from-[#ffd700] to-[#ffed4e]',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-[#f8f9fa]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#2c3e50] mb-4">
            Как это работает
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Четыре простых шага к чистоте в вашем доме
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] via-[#ff4757] via-[#2ed573] to-[#ffd700] opacity-20"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step card */}
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 relative z-10">
                {/* Number */}
                <div className={`absolute -top-6 left-8 w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="mt-8 mb-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} opacity-10`}>
                    <step.icon className={`w-8 h-8 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#2c3e50] mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow connector - mobile/tablet */}
              {index < steps.length - 1 && (
                <div className="lg:hidden flex justify-center my-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
