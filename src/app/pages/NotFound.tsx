import { useNavigate } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-purple-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Страница не найдена</h1>
          <p className="text-gray-600">
            К сожалению, страница, которую вы ищете, не существует
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
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
}
