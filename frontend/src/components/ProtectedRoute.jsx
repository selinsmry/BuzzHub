import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Token'ı kontrol et
  const checkToken = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Token yoksa login'e yönlendir
    if (!accessToken && !refreshToken) {
      return false;
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
          return false;
        }

        return true;
      }
    } catch (error) {
      console.error('Token kontrol hatası:', error);
      return false;
    }

    return false;
  };

  // Token geçerliyse sayfayı göster, değilse login'e yönlendir
  return checkToken() ? children : <Navigate to="/login" replace />;
}
