import { Trash2, Phone, Mail, MapPin, Instagram, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#2c3e50] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-3 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <span className="text-lg font-semibold">Вынос Мусора Казань</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Первый P2P сервис выноса мусора в Татарстане. Быстро, удобно, доступно.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">Сервис</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Как это работает</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Районы обслуживания</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Тарифы</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Стать исполнителем</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">О нас</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Блог</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Вакансии</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Пресс-центр</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/70">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-semibold">+7 (843) 123-45-67</div>
                  <div className="text-sm">Пн-Вс 8:00-22:00</div>
                </div>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@vynosmусора.ru" className="hover:text-white transition-colors">
                  info@vynosmusora.ru
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>г. Казань, Республика Татарстан</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/60 text-sm">
              © 2026 Вынос Мусора Казань. Все права защищены.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-white transition-colors">Пользовательское соглашение</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="bg-white/5 px-4 py-2 rounded-lg text-xs text-white/60 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2ed573] rounded-full"></div>
              SSL-защищенное соединение
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-lg text-xs text-white/60 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2ed573] rounded-full"></div>
              Безопасные платежи ЮKassa
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-lg text-xs text-white/60 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2ed573] rounded-full"></div>
              Гарантия возврата средств
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
