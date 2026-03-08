import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/api';

export function useUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      
      if (isDemoMode) {
        setUser({ name: 'Gerald Fegalan', email: 'geraldfegalan@gmail.com', role: 'user' });
        setLoading(false);
        return;
      }

      try {
        const userData = await auth.me();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  return { user, loading, setUser };
}
