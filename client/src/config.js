/**
 * Конфигурация API для клиентской части
 * 
 * В режиме разработки (npm start) API доступен по адресу http://localhost:5001
 * При запуске через Docker API доступен по относительному пути /api
 */

// Определяем базовый URL API в зависимости от окружения
const getApiBaseUrl = () => {
  // Если приложение запущено через Docker или на production сервере,
  // используем относительный путь /api
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // В режиме разработки используем полный URL с указанием порта сервера
  return 'http://localhost:5001/api';
};

// Экспортируем базовый URL API для использования в компонентах
export const API_BASE_URL = getApiBaseUrl(); 