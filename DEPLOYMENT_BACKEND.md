# 🚀 Развертывание Webhook на бэкенде

## 📋 Быстрый старт

### 1. Подключение к серверу

```bash
ssh root@194.87.0.193
# Пароль: 6BFNsKPHU8
```

### 2. Переход в директорию проекта

```bash
cd /root/telegram-bot
```

### 3. Создание файлов webhook

**Вариант A: Автоматически (рекомендуется)**

```bash
# Скопируйте скрипт на сервер
# На вашем компьютере:
scp scripts/create-webhook-files.js root@194.87.0.193:/root/telegram-bot/

# На сервере:
cd /root/telegram-bot
node scripts/create-webhook-files.js
```

**Вариант B: Вручную**

Создайте файлы согласно структуре в `scripts/backend-integration-guide.md`

### 4. Обновление базы данных

```bash
# Скопируйте SQL скрипт
scp scripts/update-database.sql root@194.87.0.193:/root/telegram-bot/

# На сервере выполните:
mysql -u root -p your_database_name < update-database.sql
```

### 5. Интеграция в приложение

Найдите главный файл (`app.js`, `server.js`, `index.js`) и добавьте:

```javascript
const telegramWebhookRouter = require('./routes/telegram/webhook');
app.use('/api/telegram', telegramWebhookRouter);
```

### 6. Реализация функций БД

В `routes/telegram/webhook.js` замените заглушки на реальные функции работы с вашей БД.

### 7. Настройка переменных окружения

Убедитесь что в `.env` есть:

```env
TELEGRAM_BOT_TOKEN=7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8
PRODUCTS_CHANNEL_ID=-1003271699368
NOTIFICATIONS_CHANNEL_ID=-1003018207910
ADMIN_USER_ID=1
```

### 8. Настройка webhook

```bash
# Скопируйте скрипт настройки
scp scripts/setup-webhook.sh root@194.87.0.193:/root/telegram-bot/

# На сервере:
chmod +x setup-webhook.sh
./setup-webhook.sh
```

Или вручную:

```bash
curl -X POST "https://api.telegram.org/bot7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://194.87.0.193/api/telegram/webhook",
    "allowed_updates": ["channel_post", "edited_channel_post"]
  }'
```

**⚠️ Важно:** URL должен быть HTTPS. Настройте SSL сертификат через Let's Encrypt.

### 9. Перезапуск приложения

```bash
# PM2
pm2 restart telegram-bot

# systemd
systemctl restart telegram-bot
```

### 10. Тестирование

1. Отправьте сообщение в канал `-1003271699368`:
```
📝 Тестовый товар

💰 Цена: 10000 руб
```

2. Проверьте:
   - ✅ Логи приложения (должен прийти webhook)
   - ✅ База данных (товар создан)
   - ✅ Сообщение в канале (добавлен `#product_id`)
   - ✅ Канал уведомлений (пришло уведомление)

---

## 📁 Структура файлов

После развертывания структура должна быть:

```
/root/telegram-bot/
├── routes/
│   └── telegram/
│       └── webhook.js          # ✅ Роут webhook
├── utils/
│   └── telegram/
│       ├── parser.js           # ✅ Парсер сообщений
│       ├── api.js              # ✅ Утилиты Telegram API
│       └── notifications.js    # ✅ Утилиты уведомлений
├── .env                        # ✅ Переменные окружения
└── app.js (или server.js)      # ✅ Главный файл (обновлен)
```

---

## 🔧 Детальная инструкция

См. `scripts/backend-integration-guide.md` для пошаговой инструкции.

---

## ⚠️ Важные моменты

1. **HTTPS обязателен** - настройте SSL через Let's Encrypt
2. **Бот должен быть администратором** обоих каналов
3. **Всегда возвращайте 200** даже при ошибках
4. **Логируйте все** для отладки
5. **Используйте транзакции** для последовательных ID

---

## 🐛 Отладка

### Проверка webhook

```bash
curl "https://api.telegram.org/bot7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8/getWebhookInfo"
```

### Проверка логов

```bash
pm2 logs telegram-bot --lines 50
```

### Тестирование вручную

```bash
curl -X POST http://localhost:3000/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "channel_post": {
      "message_id": 123,
      "chat": {"id": -1003271699368},
      "caption": "📝 Тест\n💰 Цена: 10000 руб"
    }
  }'
```

---

## 📚 Документация

- `BACKEND_WEBHOOK_IMPLEMENTATION.md` - полная реализация
- `BACKEND_NOTIFICATION_IMPLEMENTATION.md` - уведомления
- `WEBHOOK_SETUP_GUIDE.md` - настройка webhook
- `scripts/backend-integration-guide.md` - интеграция

---

**Статус:** Готово к развертыванию  
**Приоритет:** Высокий

