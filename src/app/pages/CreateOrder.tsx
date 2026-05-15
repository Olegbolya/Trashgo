import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

export default function CreateOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const district = (location.state as any)?.suggestedDistrict;

  useEffect(() => {
    // This page was replaced by the inline create form in CustomerDashboard.
    // Redirect preserving any district hint via sessionStorage.
    if (district) sessionStorage.setItem('createOrder_district', district);
    navigate('/customer?tab=create', { replace: true });
  }, []);

  return null;
}
