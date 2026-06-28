import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/auth.store';

export default function UnifiedDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?.role === 'contractor') {
      navigate('/contractor', { replace: true });
    } else {
      navigate('/customer', { replace: true });
    }
  }, [user, navigate]);

  return null;
}
