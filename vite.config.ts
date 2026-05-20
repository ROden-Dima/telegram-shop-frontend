// Импортируем необходимые плагины и функции
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  // Плагины для поддержки React и путей из tsconfig.json
  plugins: [
    react(),          // Добавляет поддержку JSX и React Fast Refresh
    tsconfigPaths()   // Позволяет использовать алиасы путей из tsconfig.json
  ],

  // Настройка сервера для разработки (не влияет на итоговую сборку)
  server: {
    port: 3000,       // Локальный порт для разработки
    open: false       // Не открывать браузер автоматически
  },

  // Настройки сборки проекта
  build: {
    outDir: "dist",   // Папка, куда Vite сохранит готовый сайт
    assetsDir: "assets", // Папка для статических файлов (css, js, img)
    sourcemap: false, // Не создавать карты кода (для уменьшения размера)
    minify: 'terser', // Минифицировать код (удалять пробелы, сокращать имена)
    
    // Дополнительная оптимизация для уменьшения размера бандла
    rollupOptions: {
      output: {
        // Ручное разделение кода на чанки (пакеты) для оптимизации загрузки
        manualChunks: {
          // Все библиотеки React в один файл
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Все компоненты Ant Design в один файл
          'antd-vendor': ['antd', '@ant-design/icons'],
          // Библиотеки для работы с данными и запросами
          'query-vendor': ['@tanstack/react-query'],
          // Библиотеки для интеграции с Telegram
          'telegram-vendor': ['@vkruglikov/react-telegram-web-app', 'react-telegram-webapp']
        }
      }
    }
  },

  // Базовый путь для всех ассетов на сайте. 
  // Ключевой параметр для корректной работы маршрутизации в SPA.
  base: "/"
});