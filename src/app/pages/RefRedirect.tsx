import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

export default function RefRedirect() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) sessionStorage.setItem('pendingRefCode', code);
    const role = searchParams.get('role');
    if (role) sessionStorage.setItem('pendingRefRole', role);
    navigate('/login', { replace: true });
  }, [code, navigate, searchParams]);

  return null;
}
