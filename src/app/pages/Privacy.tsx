import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PrivacyFooter from '../components/PrivacyFooter';

export default function Privacy() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const surface = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: muted, cursor: 'pointer', marginBottom: '1.5rem', fontFamily: 'inherit', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={16} /> Назад
        </button>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: text }}>
          Политика конфиденциальности
        </h1>
        <p style={{ color: muted, fontSize: '0.875rem', marginBottom: '2rem' }}>
          Последнее обновление: 29 июня 2026 г.
        </p>

        <div style={{ background: surface, borderRadius: '1rem', border: `1px solid ${border}`, padding: '2rem', lineHeight: 1.8 }}>

          <Section title="1. Общие положения" text={muted}>
            <p>Настоящая Политика конфиденциальности (далее — «Политика») описывает, как платформа TrashGo (далее — «Сервис», «мы») собирает, использует и защищает персональные данные пользователей в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».</p>
            <p>Используя Сервис, вы выражаете согласие с условиями настоящей Политики. Если вы не согласны с какими-либо условиями, пожалуйста, прекратите использование Сервиса.</p>
            <p>Оператор персональных данных: физическое лицо — владелец платформы TrashGo, г. Казань, Республика Татарстан.</p>
          </Section>

          <Divider color={border} />

          <Section title="2. Какие данные мы собираем" text={muted}>
            <p><strong>При регистрации:</strong></p>
            <ul>
              <li>Номер мобильного телефона</li>
              <li>Имя пользователя</li>
              <li>Выбранная роль (заказчик / исполнитель)</li>
              <li>Район проживания / работы</li>
            </ul>
            <p><strong>При использовании Сервиса:</strong></p>
            <ul>
              <li>Адреса для вывоза мусора</li>
              <li>История заказов (адрес, дата, объём, цена)</li>
              <li>Загружаемые фотографии (результаты выполнения заказов)</li>
              <li>Оценки и отзывы</li>
              <li>Технические данные: IP-адрес, тип устройства, браузер, время сеансов</li>
            </ul>
            <p><strong>Мы НЕ собираем:</strong> платёжные данные (номера карт, реквизиты счетов), геолокацию без явного запроса, данные из адресной книги устройства.</p>
          </Section>

          <Divider color={border} />

          <Section title="3. Как мы используем ваши данные" text={muted}>
            <p>Персональные данные используются исключительно в следующих целях:</p>
            <ul>
              <li>Идентификация и аутентификация пользователей</li>
              <li>Обеспечение функционирования Сервиса (создание заказов, поиск исполнителей)</li>
              <li>Отправка OTP-кодов для подтверждения входа</li>
              <li>Уведомления о статусе заказов (push, SMS при наличии согласия)</li>
              <li>Расчёт рейтинга и системы достижений</li>
              <li>Техническая поддержка пользователей</li>
              <li>Предотвращение мошенничества и злоупотреблений</li>
            </ul>
          </Section>

          <Divider color={border} />

          <Section title="4. Передача данных третьим лицам" text={muted}>
            <p>Мы не продаём и не передаём ваши персональные данные третьим лицам в коммерческих целях.</p>
            <p>Ограниченная передача данных возможна в следующих случаях:</p>
            <ul>
              <li><strong>Между пользователями:</strong> при принятии заказа исполнитель видит имя заказчика и адрес вывоза; заказчик видит имя исполнителя. Номер телефона передаётся только в рамках активного заказа.</li>
              <li><strong>SMS-провайдер (SMS.ru):</strong> только номер телефона для доставки OTP-кода.</li>
              <li><strong>Telegram:</strong> только при явной привязке аккаунта для получения OTP.</li>
              <li><strong>По требованию закона:</strong> при наличии законного запроса от уполномоченных органов.</li>
            </ul>
          </Section>

          <Divider color={border} />

          <Section title="5. Хранение и защита данных" text={muted}>
            <p>Данные хранятся на серверах Timeweb (Россия, г. Москва). Соединение защищено протоколом TLS 1.3. Пароли не хранятся — вход осуществляется через VK ID или OTP.</p>
            <p>Срок хранения данных: в течение всего времени использования аккаунта и 1 год после удаления аккаунта (для соблюдения законодательных требований).</p>
          </Section>

          <Divider color={border} />

          <Section title="6. Ваши права" text={muted}>
            <p>В соответствии с 152-ФЗ вы имеете право:</p>
            <ul>
              <li><strong>Доступ:</strong> запросить информацию о хранящихся данных</li>
              <li><strong>Исправление:</strong> обновить неточные данные в разделе «Профиль»</li>
              <li><strong>Удаление:</strong> запросить удаление аккаунта и всех связанных данных</li>
              <li><strong>Отзыв согласия:</strong> отозвать согласие на обработку данных</li>
              <li><strong>Жалоба:</strong> обратиться в Роскомнадзор (rkn.gov.ru)</li>
            </ul>
            <p>Для реализации прав обратитесь по адресу: <strong>info@vynosmusora.ru</strong></p>
          </Section>

          <Divider color={border} />

          <Section title="7. Cookies" text={muted}>
            <p>Сервис использует localStorage браузера для хранения сессионных токенов (JWT) и пользовательских настроек (тема оформления). Данные хранятся локально на вашем устройстве и не передаются на сторонние серверы.</p>
            <p>Для очистки данных используйте функцию «Выйти из аккаунта» или очистку данных браузера.</p>
          </Section>

          <Divider color={border} />

          <Section title="8. Изменения в Политике" text={muted}>
            <p>Мы вправе обновлять настоящую Политику. При существенных изменениях пользователи будут уведомлены через интерфейс Сервиса. Дата последнего обновления указана вверху страницы.</p>
          </Section>

          <Divider color={border} />

          <Section title="9. Контакты" text={muted}>
            <p>По вопросам, связанным с обработкой персональных данных:</p>
            <ul>
              <li>Email: <a href="mailto:support@trashgo.pro">support@trashgo.pro</a></li>
              <li>Адрес: г. Казань, Республика Татарстан</li>
            </ul>
          </Section>

        </div>
      </div>
      <PrivacyFooter />
    </div>
  );
}

function Section({ title, children, text }: { title: string; children: React.ReactNode; text: string }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h2>
      <div style={{ color: text, fontSize: '0.9rem' }}>{children}</div>
    </div>
  );
}

function Divider({ color }: { color: string }) {
  return <hr style={{ border: 'none', borderTop: `1px solid ${color}`, margin: '1.5rem 0' }} />;
}
