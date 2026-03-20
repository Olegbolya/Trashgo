import { useNavigate } from 'react-router';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function OrderConfirmed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Заказ создан!</h1>
          <p className="text-gray-600">
            Ваш заказ опубликован. Исполнители уже начали присылать предложения.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}