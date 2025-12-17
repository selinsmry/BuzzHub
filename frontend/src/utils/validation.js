// Form Validation Utilities

export const validation = {
  // Username validation
  username: (value) => {
    if (!value) return "Kullanıcı adı gereklidir";
    if (value.length < 3) return "Kullanıcı adı en az 3 karakter olmalıdır";
    if (value.length > 20) return "Kullanıcı adı maksimum 20 karakter olabilir";
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) 
      return "Kullanıcı adı sadece harf, sayı, _ ve - içerebilir";
    return null;
  },

  // Email validation
  email: (value) => {
    if (!value) return "Email gereklidir";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Geçerli bir email adresi girin";
    return null;
  },

  // Password validation
  password: (value) => {
    if (!value) return "Şifre gereklidir";
    if (value.length < 6) return "Şifre en az 6 karakter olmalıdır";
    if (value.length > 50) return "Şifre maksimum 50 karakter olabilir";
    if (!/[a-z]/.test(value)) return "Şifre en az bir küçük harf içermelidir";
    if (!/[A-Z]/.test(value)) return "Şifre en az bir büyük harf içermelidir";
    if (!/[0-9]/.test(value)) return "Şifre en az bir rakam içermelidir";
    return null;
  },

  // Confirm password
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return "Şifre tekrarı gereklidir";
    if (password !== confirmPassword) return "Şifreler eşleşmiyor";
    return null;
  },

  // Post title validation
  postTitle: (value) => {
    if (!value) return "Başlık gereklidir";
    if (value.length < 3) return "Başlık en az 3 karakter olmalıdır";
    if (value.length > 300) return "Başlık maksimum 300 karakter olabilir";
    return null;
  },

  // Post content validation
  postContent: (value) => {
    if (!value) return "İçerik gereklidir";
    if (value.length < 10) return "İçerik en az 10 karakter olmalıdır";
    if (value.length > 10000) return "İçerik maksimum 10000 karakter olabilir";
    return null;
  },

  // Community name validation
  communityName: (value) => {
    if (!value) return "Topluluk adı gereklidir";
    if (value.length < 3) return "Topluluk adı en az 3 karakter olmalıdır";
    if (value.length > 50) return "Topluluk adı maksimum 50 karakter olabilir";
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) 
      return "Topluluk adı sadece harf, sayı, _ ve - içerebilir";
    return null;
  },

  // Community description validation
  communityDescription: (value) => {
    if (!value) return "Açıklama gereklidir";
    if (value.length < 10) return "Açıklama en az 10 karakter olmalıdır";
    if (value.length > 500) return "Açıklama maksimum 500 karakter olabilir";
    return null;
  },

  // Comment validation
  comment: (value) => {
    if (!value) return "Yorum gereklidir";
    if (value.length < 2) return "Yorum en az 2 karakter olmalıdır";
    if (value.length > 5000) return "Yorum maksimum 5000 karakter olabilir";
    return null;
  },

  // Bio validation
  bio: (value) => {
    if (value && value.length > 250) return "Bio maksimum 250 karakter olabilir";
    return null;
  }
};

// Validate form object
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    if (typeof rule === 'function') {
      const error = rule(value);
      if (error) errors[field] = error;
    } else if (Array.isArray(rule)) {
      for (let validator of rule) {
        const error = validator(value);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }
  });

  return errors;
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Check if form has errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
