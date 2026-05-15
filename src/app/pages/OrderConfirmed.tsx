import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle2, Home, Star } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function OrderConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { xpEarned?: number; address?: string } | null) ?? {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Заказ создан!</h1>
          <p className="text-gray-600">
            {state.address
              ? `Заказ по адресу «${state.address}» опубликован. Исполнители уже ищут заявку.`
              : 'Ваш заказ опубликован. Исполнители уже начали присылать предложения.'}
          </p>
          {typeof state.xpEarned === 'number' && state.xpEarned > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              +{state.xpEarned} XP за новый заказ
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/customer')}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}