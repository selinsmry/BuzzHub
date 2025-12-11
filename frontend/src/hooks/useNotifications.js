import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  // Socket bağlantısını kur
  useEffect(() => {
    if (!userId) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✓ Socket bağlantısı kuruldu:', newSocket.id);
      newSocket.emit('user-join', userId);
    });

    // Yeni bildirim alındığında
    newSocket.on('notification', (notification) => {
      console.log('📢 Yeni bildirim:', notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    // Kullanıcı durumu değiştiğinde
    newSocket.on('user-status', (data) => {
      console.log('👥 Kullanıcı durumu:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('✗ Socket bağlantısı kesildi');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Bildirimleri backend'den getir
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${SOCKET_URL}/api/notifications/${userId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Bildirimler getirilirken hata:', error);
    }
  }, [userId]);

  // İlk yüklemede bildirimleri getir
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Bildirimi sil
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await fetch(`${SOCKET_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationId)
      );
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
    }
  }, []);

  return {
    notifications,
    deleteNotification,
    socket,
    fetchNotifications,
  };
};
