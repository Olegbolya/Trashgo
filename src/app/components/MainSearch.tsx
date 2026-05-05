import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Calendar, Package, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

export function MainSearch() {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<'create' | 'find'>('create');
  const [formData, setFormData] = useState({
    address: '',
    date: '',
    time: '',
    volume: '3-5',
    price: '',
    district: 'Вахитовский',
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/create-order', { state: formData });
  };

  const handleFindOrders = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/find-orders-new', { state: { district: formData.district } });
  };

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl text-gray-900 mb-2">
              Вынос мусора по соседски
            </h1>
            <p className="text-gray-600">
              Создайте заказ или найдите работу рядом с домом
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'create' | 'find')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="create">Нужно вынести мусор</TabsTrigger>
              <TabsTrigger value="find">Хочу заработать</TabsTrigger>
            </TabsList>

            {/* Create order */}
            <TabsContent value="create">
              <form onSubmit={handleCreateOrder} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="space-y-4">
                  {/* Address */}
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Адрес</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="ул. Баумана, 58"
                        className="pl-10 h-12 border-gray-200"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Дата</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="date"
                          className="pl-10 h-12 border-gray-200"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Время</label>
                      <Input
                        type="time"
                        className="h-12 border-gray-200"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Volume */}
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Объем</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, volume: '1-2' })}
                        className={`border-2 rounded-xl p-4 transition-colors ${
                          formData.volume === '1-2' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-900'
                        }`}
                      >
                        <Package className={`w-6 h-6 mx-auto mb-2 ${formData.volume === '1-2' ? 'text-gray-900' : 'text-gray-400'}`} />
                        <div className="text-sm font-medium">1-2 мешка</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, volume: '3-5' })}
                        className={`border-2 rounded-xl p-4 transition-colors ${
                          formData.volume === '3-5' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-900'
                        }`}
                      >
                        <Package className={`w-6 h-6 mx-auto mb-2 ${formData.volume === '3-5' ? 'text-gray-900' : 'text-gray-400'}`} />
                        <div className="text-sm font-medium">3-5 мешков</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, volume: 'Больше' })}
                        className={`border-2 rounded-xl p-4 transition-colors ${
                          formData.volume === 'Больше' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-900'
                        }`}
                      >
                        <Package className={`w-6 h-6 mx-auto mb-2 ${formData.volume === 'Больше' ? 'text-gray-900' : 'text-gray-400'}`} />
                        <div className="text-sm font-medium">Больше</div>
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Готов заплатить</label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        placeholder="50"
                        className="h-12 border-gray-200"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                      <span className="text-gray-600">₽</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white mt-6">
                    Создать заказ
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Исполнители увидят ваш заказ и предложат свою цену
                  </p>
                </div>
              </form>
            </TabsContent>

            {/* Find work */}
            <TabsContent value="find">
              <form onSubmit={handleFindOrders} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="space-y-4">
                  {/* District */}
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Район</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-lg bg-white"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      >
                        <option>Вахитовский</option>
                        <option>Приволжский</option>
                        <option>Советский</option>
                        <option>Ново-Савиновский</option>
                        <option>Московский</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white mt-6">
                    Найти заказы
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Вы увидите активные заказы в выбранном районе
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}