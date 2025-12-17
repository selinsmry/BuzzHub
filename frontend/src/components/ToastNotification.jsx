import { useState, useEffect } from 'react';

function ToastNotification() {
  const [toasts, setToasts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [lastCheckedId, setLastCheckedId] = useState(null);

  useEffect(() => {
    // Mevcut kullanıcıyı al
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);

    // Kullanıcısının notification'larını kontrol et
    const checkNotifications = () => {
      if (user.username) {
        const userNotificationKey = `notifications_${user.username}`;
        const notifications = JSON.parse(localStorage.getItem(userNotificationKey) || '[]');
        
        if (notifications.length > 0) {
          const lastNotification = notifications[notifications.length - 1];
          
          // Yeni notification varsa göster
          if (lastNotification.id !== lastCheckedId) {
            setLastCheckedId(lastNotification.id);
            setToasts(prev => [...prev, lastNotification]);
            
            // 5 saniye sonra toast'ı kaldır
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== lastNotification.id));
            }, 5000);
          }
        }
      }
    };

    window.addEventListener('storage', checkNotifications);
    
    // Polling da yap (aynı tab'da değişiklikleri yakalayabilmek için)
    const interval = setInterval(checkNotifications, 1000);

    return () => {
      window.removeEventListener('storage', checkNotifications);
      clearInterval(interval);
    };
  }, [lastCheckedId]);

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getBackgroundColor(
            toast.type
          )} border rounded-xl p-4 max-w-sm shadow-lg backdrop-blur-sm pointer-events-auto animate-slide-in`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-xl mt-0.5">{getIcon(toast.type)}</span>
            <div>
              <p className="font-semibold">{toast.title}</p>
              <p className="text-sm opacity-90">{toast.message}</p>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ToastNotification;
