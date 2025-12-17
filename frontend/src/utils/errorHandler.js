// Error handling utility

export const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // 401 de backend'den gelen hata mesajını kontrol et (yanlış şifre gibi)
    return error.response.data?.error || "Oturum açmanız gerekiyor";
  }
  if (error.response?.status === 403) {
    return "Bu işlem için yetkiniz yok";
  }
  if (error.response?.status === 404) {
    return "Kaynak bulunamadı";
  }
  if (error.response?.status === 400) {
    return error.response.data?.error || error.response.data?.message || "İstek geçersiz";
  }
  if (error.response?.status === 500) {
    return "Sunucu hatası. Lütfen daha sonra tekrar deneyin";
  }
  if (error.request && !error.response) {
    return "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin";
  }
  
  return error.response?.data?.message || error.message || "Bir hata oluştu";
};

export const getFieldError = (error, field) => {
  if (typeof error === 'string') return null;
  if (error?.[field]) return error[field];
  return null;
};

export const isValidApiResponse = (data) => {
  return data && typeof data === 'object';
};

// Toast notification helper
export const toast = {
  success: (message) => {
    console.log('✅ Başarılı:', message);
  },
  error: (message) => {
    console.error('❌ Hata:', message);
  },
  warning: (message) => {
    console.warn('⚠️ Uyarı:', message);
  },
  info: (message) => {
    console.info('ℹ️ Bilgi:', message);
  }
};
