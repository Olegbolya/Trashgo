import { Trash2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Trash2 className="w-8 h-8" />
              </div>
              <span className="text-xl font-semibold">Вывоз Мусора Казань</span>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Вывоз Мусора в Казани
              </h1>
              <p className="text-xl lg:text-2xl text-white/90">
                От 40₽ за мешок | Первый P2P сервис в Татарстане
              </p>
            </div>

            {/* Promotional banner */}
            <div className="inline-block bg-[#ffd700] text-[#2c3e50] px-6 py-3 rounded-full font-semibold shadow-lg">
              🎉 Первые 100 заказов -50%!
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-[#ff4757] hover:bg-[#ff4757]/90 text-white border-0 rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Заказать вывоз
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-[#2ed573] hover:bg-[#2ed573]/90 text-white border-0 rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Стать исполнителем
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">1,000+</div>
                <div className="text-white/80">Заказов</div>
              </div>
              <div>
                <div className="text-3xl font-bold">200+</div>
                <div className="text-white/80">Исполнителей</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-white/80">Рейтинг</div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1679137315174-ff25263f2e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjbGVhbmVyJTIwc2VydmljZSUyMHdvcmtlcnxlbnwxfHx8fDE3NzMyMDgzNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Профессиональный работник"
                className="w-full h-[600px] object-cover"
              />
              {/* Floating card */}
              <div className="absolute bottom-8 left-8 bg-white text-[#2c3e50] p-6 rounded-2xl shadow-2xl">
                <div className="text-sm font-semibold text-[#667eea]">Средняя цена</div>
                <div className="text-3xl font-bold mt-1">40-70₽</div>
                <div className="text-sm text-gray-600 mt-1">за мешок мусора</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
