import { ArrowDown, Package, User, CheckCircle, DollarSign, MapPin, Clock, Trash2 } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-4">
            Как это работает?
          </h1>
          <p className="text-gray-600 text-lg">
            Две простые схемы взаимодействия на платформе
          </p>
        </div>

        {/* Схема 1: Заказчик создает заказ */}
        <div className="mb-16">
          <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-red-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Сценарий 1: Заказчик создает заказ</h2>
                <p className="text-gray-600">Когда у вас есть мусор, который нужно вынести</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Шаг 1 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">1</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-red-900">Заказчик создает заказ</h3>
                    </div>
                    <p className="text-red-800">
                      Указывает адрес, время, объем мусора и цену
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white rounded-lg text-sm text-red-700">📍 ул. Баумана, 58</span>
                      <span className="px-3 py-1 bg-white rounded-lg text-sm text-red-700">⏰ Сегодня 18:00</span>
                      <span className="px-3 py-1 bg-white rounded-lg text-sm text-red-700">💰 60₽</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 2 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">2</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-green-900">Мусорщик видит и бронирует</h3>
                    </div>
                    <p className="text-green-800">
                      Мусорщик находит заказ на карте, принимает его
                    </p>
                    <div className="mt-3 inline-block px-4 py-2 bg-white rounded-lg font-medium text-green-700">
                      ✅ Заказ забронирован
                    </div>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 3 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">3</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-green-900">Мусорщик выполняет заказ</h3>
                    </div>
                    <p className="text-green-800">
                      Приходит по адресу, забирает мусор, выкидывает в контейнер
                    </p>
                    <div className="mt-3 inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                      🗑️ Мусор вынесен
                    </div>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 4 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">4</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-green-900">Мусорщик отмечает выполнение</h3>
                    </div>
                    <p className="text-green-800">
                      Нажимает "Выполнено" в приложении
                    </p>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 5 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">5</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 border-2 border-red-700 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-white" />
                      <h3 className="font-bold">Заказчик подтверждает и оплачивает</h3>
                    </div>
                    <p className="text-red-100">
                      Проверяет, что мусор вынесен, и подтверждает оплату
                    </p>
                    <div className="mt-3 inline-block px-4 py-2 bg-white text-red-600 rounded-lg font-bold">
                      💸 Оплата 60₽ → Мусорщик
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Схема 2: Мусорщик создает предложение */}
        <div className="mb-16">
          <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-green-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Сценарий 2: Мусорщик создает предложение</h2>
                <p className="text-gray-600">Когда мусорщик готов вынести мусор в определенное время</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Шаг 1 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">1</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-green-900">Мусорщик создает предложение</h3>
                    </div>
                    <p className="text-green-800">
                      Указывает район, время, когда готов выносить, и цену за вынос
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white rounded-lg text-sm text-green-700">📍 Вахитовский район</span>
                      <span className="px-3 py-1 bg-white rounded-lg text-sm text-green-700">⏰ Сегодня 19:00-20:00</span>
                      <span className="px-3 py-1 bg-white rounded-lg text-sm text-green-700">💰 50₽/заказ</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 2 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">2</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-red-900">Заказчик видит и создает заказ</h3>
                    </div>
                    <p className="text-red-800">
                      Заказчик видит предложение мусорщика и создает заказ на конкретное время
                    </p>
                    <div className="mt-3 inline-block px-4 py-2 bg-white rounded-lg font-medium text-red-700">
                      📦 Заказ создан на 19:30
                    </div>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 3 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">3</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-green-900">Мусорщик подтверждает заказ</h3>
                    </div>
                    <p className="text-green-800">
                      Получает уведомление о заказе и подтверждает, что возьмет его
                    </p>
                    <div className="mt-3 inline-block px-4 py-2 bg-white rounded-lg font-medium text-green-700">
                      ✅ Заказ принят
                    </div>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 4 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">4</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-green-900">Мусорщик выполняет заказ</h3>
                    </div>
                    <p className="text-green-800">
                      Приходит по адресу, забирает мусор, выкидывает
                    </p>
                    <div className="mt-3 inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
                      🗑️ Мусор вынесен
                    </div>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 5 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">5</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-green-900">Мусорщик отмечает выполнение</h3>
                    </div>
                    <p className="text-green-800">
                      Нажимает "Выполнено" в приложении
                    </p>
                  </div>
                </div>
                <div className="ml-6 mt-2 mb-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Шаг 6 */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">6</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 border-2 border-green-700 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-white" />
                      <h3 className="font-bold">Заказчик подтверждает и оплачивает</h3>
                    </div>
                    <p className="text-green-100">
                      Проверяет, что мусор забрали, подтверждает и оплачивает
                    </p>
                    <div className="mt-3 inline-block px-4 py-2 bg-white text-green-600 rounded-lg font-bold">
                      💸 Оплата 50₽ → Мусорщик
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ключевые преимущества */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-3xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">⚡ Ключевые преимущества</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-bold mb-2">Прозрачность</h3>
              <p className="text-purple-100 text-sm">
                Обе стороны всегда знают статус заказа и следующий шаг
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold mb-2">Безопасность</h3>
              <p className="text-purple-100 text-sm">
                Оплата происходит только после подтверждения выполнения
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Гибкость</h3>
              <p className="text-purple-100 text-sm">
                Два способа работы под разные ситуации и потребности
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
