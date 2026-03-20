import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-3xl mb-8">
            <Sparkles className="w-12 h-12" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Готовы избавиться от мусора?
          </h2>

          {/* Description */}
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Создайте свой первый заказ прямо сейчас и получите скидку 50% на первый вынос
          </p>

          {/* Promotional badge */}
          <div className="inline-block bg-[#ffd700] text-[#2c3e50] px-6 py-3 rounded-full font-semibold mb-8 shadow-xl">
            🎉 Специальное предложение для новых пользователей
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-[#ff4757] hover:bg-[#ff4757]/90 text-white border-0 rounded-full px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Создать заказ сейчас
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 rounded-full px-10 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              Узнать больше
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2ed573] rounded-full"></div>
              <span>Безопасные платежи</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2ed573] rounded-full"></div>
              <span>Проверенные исполнители</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2ed573] rounded-full"></div>
              <span>Гарантия качества</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
