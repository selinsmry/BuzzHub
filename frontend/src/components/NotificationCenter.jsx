import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import * as userApi from '../api/userApi';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mevcut kullanıcıyı al
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);

    if (user.id) {
      fetchNotifications();

      // Yeni notification'lar için polling
      const interval = setInterval(() => {
        fetchNotifications();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await userApi.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await userApi.markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Bildirim güncellenemedi:', error);
    }
  };

  const removeNotification = async (id) => {
    setNotifications(notifications.filter(n => n._id !== id));
    try {
      await handleMarkAsRead(id);
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
    }
  };

  const clearAllNotifications = async () => {
    for (const notification of notifications) {
      try {
        await userApi.markNotificationAsRead(notification._id);
      } catch (error) {
        console.error('Bildirim temizlenirken hata:', error);
      }
    }
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return '👤';
      case 'comment':
        return '💬';
      case 'post':
        return '📝';
      case 'mention':
        return '@';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'follow':
        return 'border-l-purple-500 bg-purple-500/5';
      case 'comment':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'post':
        return 'border-l-green-500 bg-green-500/5';
      case 'mention':
        return 'border-l-orange-500 bg-orange-500/5';
      default:
        return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700/50 rounded-2xl shadow-2xl z-40 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/50 border-b border-gray-700/50 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Bildirimler</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                Temizle
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">Yükleniyor...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-700/50">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-700/30 transition-colors border-l-4 ${
                    notification.read
                      ? 'opacity-75'
                      : 'bg-gray-700/20'
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">
                          {notification.senderId?.username || 'Bilinmeyen Kullanıcı'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeNotification(notification._id)}
                      className="text-gray-400 hover:text-gray-300 transition-colors ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                  {notification.createdAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString('tr-TR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-400">Bildirim yok</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
