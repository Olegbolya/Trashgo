import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

export default function RefRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) sessionStorage.setItem('pendingRefCode', code);
    navigate('/login', { replace: true });
  }, [code, navigate]);

  return null;
}
