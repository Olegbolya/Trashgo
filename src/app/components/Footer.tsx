import { Trash2, Mail, MapPin, Instagram, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#2c3e50] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/icon-72.png" alt="TrashGo" style={{ width: 48, height: 48, borderRadius: '0.875rem', objectFit: 'cover', flexShrink: 0 }} />
              <span className="text-lg font-semibold">TrashGo — Вывоз Мусора Казань</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Первый P2P сервис вывоза мусора в Татарстане. Быстро, удобно, доступно.
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
              <li><a href="/how-it-works" className="text-white/70 hover:text-white transition-colors">Как это работает</a></li>
              <li><a href="/login" className="text-white/70 hover:text-white transition-colors">Создать заказ</a></li>
              <li><a href="/login" className="text-white/70 hover:text-white transition-colors">Стать исполнителем</a></li>
              <li><a href="/terms" className="text-white/70 hover:text-white transition-colors">Условия использования</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-3">
              <li><a href="/privacy" className="text-white/70 hover:text-white transition-colors">Политика конфиденциальности</a></li>
              <li><a href="/how-it-works" className="text-white/70 hover:text-white transition-colors">FAQ</a></li>
              <li>
                <span className="text-white/40 text-sm">Казань, Татарстан</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:support@trashgo.pro" className="hover:text-white transition-colors">
                  support@trashgo.pro
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>г. Казань, Республика Татарстан</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Privacy summary */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Политика конфиденциальности — ключевые положения</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { n: '1', t: 'Сбор данных', d: 'Собираем только телефон, имя и адреса вывоза, необходимые для работы сервиса.' },
              { n: '2', t: 'Цель обработки', d: 'Данные используются исключительно для обеспечения заказов и связи между пользователями.' },
              { n: '3', t: 'Передача третьим лицам', d: 'Не продаём данные. Передача возможна только SMS-провайдеру (OTP) и по требованию закона.' },
              { n: '4', t: 'Хранение и защита', d: 'Серверы Timeweb (Россия), шифрование TLS 1.3. Вход через VK ID или OTP — пароли не хранятся.' },
              { n: '5', t: 'Ваши права', d: 'Право на доступ, исправление и удаление данных. Обращайтесь: support@trashgo.pro' },
              { n: '6', t: 'Cookies', d: 'Используем только localStorage для токена сессии и темы оформления.' },
            ].map(p => (
              <div key={p.n} className="bg-white/5 rounded-xl p-3 flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 flex-shrink-0 mt-0.5">{p.n}</div>
                <div>
                  <div className="text-xs font-semibold text-white/80 mb-0.5">{p.t}</div>
                  <div className="text-xs text-white/50 leading-relaxed">{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/60 text-sm">
              © 2026 Вывоз Мусора Казань. Все права защищены.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/60">
              <a href="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</a>
              <a href="/terms" className="hover:text-white transition-colors">Пользовательское соглашение</a>
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
              P2P — расчёты напрямую
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-lg text-xs text-white/60 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#2ed573] rounded-full"></div>
              Система рейтингов и отзывов
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
