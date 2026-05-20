import axios from "axios"

// Временно жёстко прописываем адрес бэкенда
const API_BASE_URL = 'http://localhost:3001/api'

const Api = axios.create({
 baseURL: 'https://telegram-shop-backend-bbyp.onrender.com/api',
  headers: {
    Accept: "*/*"
  },
  // Таймауты для предотвращения долгого ожидания
  timeout: 10000, // 10 секунд
  timeoutErrorMessage: 'Запрос превысил время ожидания. Проверьте подключение к интернету.'
})

Api.interceptors.request.use(
  (config) => config,
  (err) => Promise.reject(err)
)

Api.interceptors.response.use(
  (response) => response,
  (err) => {
    // Логируем ошибки для отладки
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else if (err.request) {
      console.error('API Request Error:', 'Нет ответа от сервера. Проверьте подключение к интернету и URL API.');
    } else {
      console.error('API Error:', err.message);
    }
    return Promise.reject(err);
  }
)

export default Api