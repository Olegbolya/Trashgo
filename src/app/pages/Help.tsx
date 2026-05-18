import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, ExternalLink, Zap, Shield, Package, Clock, Star, Trash2, Send, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../../api/client';

const ACCENT = '#2196F3';
const GREEN  = '#4CAF50';

interface FaqItem {
  q: string;
  a: string;
}

interface SupportMessage {
  id: string;
  message: string;
  reply: string | null;
  repliedAt: string | null;
  status: string;
  createdAt: string;
}

const faqCustomer: FaqItem[] = [
  { q: 'Как создать заказ?', a: 'Перейдите в личный кабинет → нажмите «Создать заказ» → укажите адрес, время, объём мусора и цену. Заказ появится у исполнителей рядом с вами.' },
  { q: 'Когда спишется оплата?', a: 'Оплата списывается только после того, как вы подтвердите выполнение заказа. До этого деньги не списываются.' },
  { q: 'Что если исполнитель не пришёл?', a: 'Если исполнитель не выполнил заказ, он возвращается в общую очередь и становится доступен другим. Деньги не списываются.' },
  { q: 'Как изменить адрес вывоза?', a: 'Откройте раздел «Профиль» → «Адреса вывоза». Там можно добавить, удалить или изменить адрес.' },
  { q: 'Как оставить отзыв исполнителю?', a: 'После завершения заказа появится форма оценки. Вы сможете поставить от 1 до 5 звёзд и написать комментарий.' },
  { q: 'Можно ли отменить заказ?', a: 'Да, заказ можно отменить до того, как исполнитель возьмёт его в работу. После принятия — свяжитесь с поддержкой.' },
];

const faqContractor: FaqItem[] = [
  { q: 'Как начать работать?', a: 'Зарегистрируйтесь как исполнитель, укажите район и способ передвижения. После этого вы увидите доступные заказы рядом с вами.' },
  { q: 'Когда приходят деньги?', a: 'Деньги зачисляются на баланс сразу после подтверждения заказа заказчиком. Вывод доступен в любое время.' },
  { q: 'Что значат уровни и XP?', a: 'За каждый выполненный заказ вы получаете XP (опыт). Накапливайте опыт, повышайте уровень и разблокируйте достижения.' },
  { q: 'Как работает рейтинг?', a: 'После каждого заказа заказчик может оставить оценку. Средний рейтинг отображается в профиле и влияет на видимость.' },
  { q: 'Можно ли работать без автомобиля?', a: 'Да. Укажите способ передвижения: пеший, самокат, велосипед, электровелосипед, мото или автомобиль.' },
  { q: 'Что делать если заказчик не подтверждает?', a: 'Обратитесь в поддержку — мы разберём ситуацию и при необходимости зачислим оплату вручную.' },
];

function FaqSection({ items }: { items: FaqItem[] }) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState<number | null>(null);

  const c = {
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${open === i ? ACCENT + '40' : c.border}` }}>
          <button
            className="w-full flex items-center justify-between p-4 text-left"
            style={{ background: open === i ? `${ACCENT}08` : c.surface, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-medium pr-3" style={{ color: c.text }}>{item.q}</span>
            {open === i
              ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
              : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: c.muted }} />}
          </button>
          {open === i && (
            <div className="px-4 pb-4" style={{ background: open === i ? `${ACCENT}08` : c.surface }}>
              <div className="text-sm leading-relaxed" style={{ color: c.muted }}>{item.a}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Help() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'customer' | 'contractor'>('customer');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  const loadMessages = useCallback(async () => {
    setLoadingChat(true);
    try {
      const r = await api.get<{ data: SupportMessage[] }>('/support');
      setMessages(r.data.slice().reverse());
    } catch {
      // ignore
    } finally {
      setLoadingChat(false);
    }
  }, []);

  useEffect(() => {
    if (chatOpen) {
      loadMessages();
    }
  }, [chatOpen, loadMessages]);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, chatOpen]);

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const r = await api.post<{ data: SupportMessage }>('/support', { message: text });
      setMessages(prev => [...prev, r.data]);
      setNewMessage('');
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const contacts = [
    {
      icon: MessageCircle,
      color: GREEN,
      title: 'Написать в чат',
      sub: 'Ответим в течение 15 минут',
      action: () => setChatOpen(true),
    },
    {
      icon: Phone,
      color: ACCENT,
      title: '+7 (800) 000-00-00',
      sub: 'Бесплатно, пн–вс 9:00–21:00',
      action: () => { window.location.href = 'tel:+78000000000'; },
    },
    {
      icon: Mail,
      color: '#FF9800',
      title: 'support@trashgo.ru',
      sub: 'Ответ в течение 2 часов',
      action: () => { window.location.href = 'mailto:support@trashgo.ru'; },
    },
  ];

  const quickLinks = [
    { icon: Zap,      color: ACCENT, title: 'Как это работает?',   action: () => navigate('/how-it-works') },
    { icon: Package,  color: GREEN,  title: 'Создать заказ',        action: () => navigate('/customer?tab=create') },
    { icon: Star,     color: '#FF9800', title: 'Реферальная программа', action: () => navigate('/invite-neighbor') },
    { icon: Trash2,   color: GREEN,  title: 'Найти заказы',         action: () => navigate('/find-orders-new') },
  ];

  return (
    <div className="min-h-screen pb-14" style={{ background: c.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Назад</span>
            </button>
            <div className="text-sm font-semibold" style={{ color: c.text }}>Помощь и поддержка</div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-4 max-w-2xl space-y-4">

        {/* Hero */}
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${ACCENT}, #1565C0)` }}>
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-18 -mt-18" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full -ml-14 -mb-14" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold mb-1">Чем можем помочь?</h1>
              <p className="text-white/85 text-sm">Найдите ответ в FAQ или свяжитесь с нами — мы на связи каждый день с 9 до 21.</p>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Связаться с поддержкой</h2>
          <div className="space-y-2">
            {contacts.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: c.subtle, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: c.text }}>{item.title}</div>
                    <div className="text-xs" style={{ color: c.muted }}>{item.sub}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: c.muted }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Work hours */}
        <div className="rounded-2xl p-4" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: c.text }}>Часы работы поддержки</div>
              <div className="text-xs space-y-0.5" style={{ color: c.textSub }}>
                <div>Пн–Пт: <strong>9:00 – 21:00</strong></div>
                <div>Сб–Вс: <strong>10:00 – 19:00</strong></div>
                <div className="mt-1" style={{ color: c.muted }}>Чат-бот работает круглосуточно 24/7</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Частые вопросы</h2>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: c.subtle }}>
            {(['customer', 'contractor'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: activeTab === tab ? c.surface : 'transparent',
                  border: activeTab === tab ? `1px solid ${c.border}` : 'none',
                  color: activeTab === tab ? c.text : c.muted,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab === 'customer' ? '👤 Заказчик' : '🚴 Исполнитель'}
              </button>
            ))}
          </div>

          <FaqSection items={activeTab === 'customer' ? faqCustomer : faqContractor} />
        </div>

        {/* Security block */}
        <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GREEN}18` }}>
              <Shield className="w-5 h-5" style={{ color: GREEN }} />
            </div>
            <div>
              <div className="text-sm font-semibold mb-1" style={{ color: c.text }}>Ваша безопасность</div>
              <div className="text-xs leading-relaxed" style={{ color: c.muted }}>
                Все сделки защищены платформой. Оплата проходит только после подтверждения выполнения. Данные хранятся в зашифрованном виде.
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
          <h2 className="text-base font-semibold mb-3" style={{ color: c.text }}>Быстрые ссылки</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <button
                  key={i}
                  onClick={link.action}
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: c.subtle, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}18` }}>
                    <Icon className="w-4 h-4" style={{ color: link.color }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: c.text }}>{link.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* App version */}
        <div className="text-center text-xs py-2" style={{ color: c.muted }}>
          TrashGo v1.3.0 · Казань
        </div>

      </div>

      {/* Support chat drawer */}
      {chatOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setChatOpen(false)}
          />
          {/* Panel */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: c.surface, borderRadius: '1.25rem 1.25rem 0 0',
            display: 'flex', flexDirection: 'column',
            maxHeight: '85vh', overflow: 'hidden',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
          }}>
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: `${GREEN}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle style={{ width: '1rem', height: '1rem', color: GREEN }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: c.text }}>Чат поддержки</div>
                  <div style={{ fontSize: '0.75rem', color: c.muted }}>Ответим в течение 15 минут</div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                style={{ background: c.subtle, border: 'none', borderRadius: '0.5rem', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X style={{ width: '1rem', height: '1rem', color: c.muted }} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {loadingChat && (
                <div style={{ textAlign: 'center', color: c.muted, padding: '2rem', fontSize: '0.875rem' }}>Загрузка...</div>
              )}
              {!loadingChat && messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: c.muted }}>
                  <MessageCircle style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: c.text, marginBottom: '0.375rem' }}>Напишите нам</div>
                  <div style={{ fontSize: '0.8125rem' }}>Опишите проблему и мы ответим как можно скорее</div>
                </div>
              )}
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* User bubble */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ background: ACCENT, color: '#fff', borderRadius: '1rem 1rem 0.25rem 1rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {m.message}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: c.muted, textAlign: 'right', marginTop: '0.25rem' }}>{fmtTime(m.createdAt)}</div>
                    </div>
                  </div>
                  {/* Admin reply bubble */}
                  {m.reply && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{ maxWidth: '80%' }}>
                        <div style={{ fontSize: '0.6875rem', color: c.muted, marginBottom: '0.25rem' }}>Поддержка TrashGo</div>
                        <div style={{ background: c.subtle, border: `1px solid ${c.border}`, color: c.text, borderRadius: '0.25rem 1rem 1rem 1rem', padding: '0.625rem 0.875rem', fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {m.reply}
                        </div>
                        {m.repliedAt && <div style={{ fontSize: '0.6875rem', color: c.muted, marginTop: '0.25rem' }}>{fmtTime(m.repliedAt)}</div>}
                      </div>
                    </div>
                  )}
                  {/* Awaiting reply indicator */}
                  {!m.reply && m.status === 'open' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{ fontSize: '0.75rem', color: c.muted, padding: '0.375rem 0.75rem', background: c.subtle, borderRadius: '0.75rem' }}>
                        ⏳ Ожидает ответа
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${c.border}`, display: 'flex', gap: '0.5rem', flexShrink: 0, paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Опишите проблему..."
                style={{ flex: 1, height: '2.5rem', padding: '0 0.875rem', borderRadius: '0.75rem', border: `1.5px solid ${c.border}`, background: c.bg, color: c.text, fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit' }}
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: sending || !newMessage.trim() ? c.subtle : ACCENT, border: 'none', cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Send style={{ width: '1rem', height: '1rem', color: sending || !newMessage.trim() ? c.muted : '#fff' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
