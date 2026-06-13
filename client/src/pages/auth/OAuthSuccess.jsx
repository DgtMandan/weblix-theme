import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function OAuthSuccess() {
  const [params] = useSearchParams();
  const { acceptToken } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    acceptToken(params.get('token')).then(() => navigate('/dashboard'));
  }, []);
  return <div className="grid min-h-screen place-items-center bg-[#0d0d0d] font800 text-white">Signing you in...</div>;
}
