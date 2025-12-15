import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Token'ı kontrol et
    const checkToken = () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // Token yoksa login'e yönlendir
      if (!accessToken && !refreshToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Access token'ı decode et
      try {
        if (accessToken) {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const expiryTime = payload.exp * 1000; // ms'ye çevir
          const now = Date.now();

          // Token expire olmuşsa login'e yönlendir
          if (expiryTime <= now) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Token kontrol hatası:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    checkToken();
  }, []);

  // Yükleme sırasında loading göster
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Token geçerliyse sayfayı göster, değilse login'e yönlendir
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
