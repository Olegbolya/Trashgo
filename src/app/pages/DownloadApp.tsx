import { useNavigate } from 'react-router';
import { ArrowLeft, Smartphone, Zap, Star, Shield, Bell, MessageCircle, RefreshCw, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ACCENT = '#22a849';
const ANDROID_APK_URL = 'https://github.com/Olegbolya/Trashgo/releases/latest/download/app-release.apk';

const FEATURES = [
  { icon: Zap, title: 'Быстрый поиск исполнителей', desc: 'Исполнители откликаются в течение нескольких минут' },
  { icon: Bell, title: 'Push-уведомления', desc: 'Мгновенные оповещения о статусе заказа' },
  { icon: MessageCircle, title: 'Встроенный чат', desc: 'Общайтесь с исполнителем прямо в приложении' },
  { icon: Star, title: 'Система рейтингов', desc: 'Честные отзывы помогают выбрать лучшего исполнителя' },
  { icon: RefreshCw, title: 'Подписки', desc: 'Настройте регулярный вывоз мусора по расписанию' },
  { icon: Shield, title: 'Безопасные платежи', desc: 'Оплата через СБП только после выполнения работ' },
];

export default function DownloadApp() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const c = {
    bg:      isDark ? '#111827' : '#f9fafb',
    surface: isDark ? '#1e2433' : '#ffffff',
    border:  isDark ? '#374151' : '#e5e7eb',
    text:    isDark ? '#f9fafb' : '#111827',
    textSub: isDark ? '#d1d5db' : '#374151',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    subtle:  isDark ? '#1f2937' : '#f3f4f6',
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: c.surface, borderBottom: `1px solid ${c.border}`, padding: '0 1rem' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', height: '56px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', padding: '0.25rem', borderRadius: '0.5rem' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: c.text }}>Скачать приложение</span>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem 0' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '24px', margin: '0 auto 1.25rem',
            background: `linear-gradient(135deg, ${ACCENT}, #1a7a35)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 32px ${ACCENT}40`,
          }}>
            <Smartphone style={{ width: 48, height: 48, color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: c.text, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            TrashGo — вывоз мусора<br />в кармане
          </h1>
          <p style={{ fontSize: '1rem', color: c.muted, lineHeight: 1.6, maxWidth: '420px', margin: '0 auto' }}>
            Заказывайте вывоз мусора, общайтесь с исполнителями и отслеживайте статус заказов прямо со смартфона.
          </p>
        </div>

        {/* Download buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2.5rem' }}>
          {/* Android */}
          <a
            href={ANDROID_APK_URL}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem', borderRadius: '1rem',
              background: isDark ? '#1f2937' : '#f0fdf4',
              border: `2px solid ${ACCENT}`,
              textDecoration: 'none', cursor: 'pointer',
              boxShadow: `0 2px 12px ${ACCENT}20`,
              transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
              background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Download style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: c.muted, marginBottom: '0.125rem' }}>Скачать для</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: c.text }}>Android</div>
              <div style={{ fontSize: '0.75rem', color: ACCENT, marginTop: '0.125rem' }}>APK · версия 1.0</div>
            </div>
            <div style={{
              padding: '0.5rem 1rem', borderRadius: '0.625rem',
              background: ACCENT, color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
            }}>
              Скачать
            </div>
          </a>

          {/* iOS — coming soon */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem', borderRadius: '1rem',
              background: c.subtle, border: `1.5px solid ${c.border}`,
              opacity: 0.7,
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
              background: c.border, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Apple icon via SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill={c.muted}>
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: c.muted, marginBottom: '0.125rem' }}>Скоро в</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: c.muted }}>App Store</div>
              <div style={{ fontSize: '0.75rem', color: c.muted, marginTop: '0.125rem' }}>iOS — в разработке</div>
            </div>
            <div style={{
              padding: '0.5rem 1rem', borderRadius: '0.625rem',
              background: c.border, color: c.muted, fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
            }}>
              Скоро
            </div>
          </div>
        </div>

        {/* Installation hint */}
        <div style={{ background: isDark ? '#1c2433' : '#fffbeb', border: `1px solid ${isDark ? '#374151' : '#fde68a'}`, borderRadius: '0.875rem', padding: '0.875rem 1rem', marginBottom: '2.5rem', display: 'flex', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#fbbf24' : '#92400e', marginBottom: '0.25rem' }}>Как установить APK на Android</div>
            <div style={{ fontSize: '0.8rem', color: isDark ? '#d1d5db' : '#78350f', lineHeight: 1.5 }}>
              Скачайте файл → откройте его → при запросе разрешите «Установку из неизвестных источников» в настройках → нажмите «Установить».
            </div>
          </div>
        </div>

        {/* Features */}
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: c.text, marginBottom: '1rem' }}>Возможности приложения</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: c.surface, borderRadius: '0.875rem', padding: '1rem',
                border: `1px solid ${c.border}`, display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 20, height: 20, color: ACCENT }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: c.text, marginBottom: '0.25rem' }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: c.muted, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <a
            href={ANDROID_APK_URL}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem', borderRadius: '1rem',
              background: `linear-gradient(135deg, ${ACCENT}, #1a7a35)`,
              color: 'white', fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none', boxShadow: `0 4px 16px ${ACCENT}50`,
            }}
          >
            <Download className="w-5 h-5" />
            Скачать для Android
          </a>
          <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: c.muted }}>Бесплатно · без рекламы · версия 1.0</p>
        </div>
      </div>
    </div>
  );
}
