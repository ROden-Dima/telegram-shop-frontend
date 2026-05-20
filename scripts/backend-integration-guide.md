# 🔧 Интеграция Webhook в существующий бэкенд

## 📋 Шаги развертывания

### Шаг 1: Подключение к серверу

```bash
ssh root@194.87.0.193
# Пароль: 6BFNsKPHU8
```

### Шаг 2: Переход в директорию проекта

```bash
cd /root/telegram-bot
```

### Шаг 3: Создание файлов webhook

Скопируйте скрипт `create-webhook-files.js` на сервер и выполните:

```bash
# На вашем компьютере
scp scripts/create-webhook-files.js root@194.87.0.193:/root/telegram-bot/

# На сервере
cd /root/telegram-bot
node scripts/create-webhook-files.js
```

Или создайте файлы вручную согласно структуре ниже.

### Шаг 4: Интеграция роута в основное приложение

Найдите главный файл приложения (обычно `app.js`, `server.js`, `index.js`):

```javascript
// Добавьте импорт роута
const telegramWebhookRouter = require('./routes/telegram/webhook');

// Подключите роут
app.use('/api/telegram', telegramWebhookRouter);
```

### Шаг 5: Обновление базы данных

Выполните SQL скрипт для добавления полей:

```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_sequence_id INT UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_message_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_channel_id BIGINT,
ADD INDEX IF NOT EXISTS idx_product_sequence_id (product_sequence_id),
ADD INDEX IF NOT EXISTS idx_telegram_message_id (telegram_message_id);
```

### Шаг 6: Реализация функций работы с БД

В файле `routes/telegram/webhook.js` замените заглушки на реальные функции:

```javascript
// Пример для MySQL с использованием mysql2
const db = require('../config/database');

async function getNextProductSequenceId() {
  const [result] = await db.query(
    'SELECT MAX(product_sequence_id) as max_id FROM products'
  );
  return (result[0]?.max_id || 0) + 1;
}

async function createProductFromTelegram(data) {
  const [result] = await db.query(
    `INSERT INTO products 
     (product_name, description, price, quantity, product_sequence_id, 
      telegram_message_id, telegram_channel_id, user_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.description,
      data.description,
      data.price,
      data.quantity || 0,
      data.productSequenceId,
      data.messageId,
      data.channelId || '-1003271699368',
      data.userId
    ]
  );
  
  return { product_Id: result.insertId, product_sequence_id: data.productSequenceId };
}
```

### Шаг 7: Настройка переменных окружения

Убедитесь что в `.env` есть:

```env
TELEGRAM_BOT_TOKEN=7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8
PRODUCTS_CHANNEL_ID=-1003271699368
NOTIFICATIONS_CHANNEL_ID=-1003018207910
ADMIN_USER_ID=1
API_URL=http://194.87.0.193
```

### Шаг 8: Настройка webhook в Telegram

```bash
curl -X POST "https://api.telegram.org/bot7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://194.87.0.193/api/telegram/webhook",
    "allowed_updates": ["channel_post", "edited_channel_post"]
  }'
```

**Важно:** URL должен быть HTTPS. Если у вас нет SSL, используйте nginx с Let's Encrypt или другой прокси.

### Шаг 9: Перезапуск приложения

```bash
# Если используется PM2
pm2 restart telegram-bot

# Или если используется systemd
systemctl restart telegram-bot

# Или просто перезапустите Node.js процесс
```

### Шаг 10: Проверка webhook

```bash
curl "https://api.telegram.org/bot7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8/getWebhookInfo"
```

Должен вернуться ваш URL без ошибок.

### Шаг 11: Тестирование

1. Отправьте сообщение в канал товаров `-1003271699368`
2. Проверьте логи приложения
3. Проверьте что товар создался в БД
4. Проверьте что сообщение обновилось с `#product_id`
5. Проверьте что уведомление пришло в канал `-1003018207910`

---

## 🔍 Структура файлов

```
/root/telegram-bot/
├── routes/
│   └── telegram/
│       └── webhook.js          # Роут webhook
├── utils/
│   └── telegram/
│       ├── parser.js           # Парсер сообщений
│       ├── api.js              # Утилиты Telegram API
│       └── notifications.js   # Утилиты уведомлений
└── .env                        # Переменные окружения
```

---

## ⚠️ Важные моменты

1. **HTTPS обязателен** для webhook - настройте SSL сертификат
2. **Бот должен быть администратором** обоих каналов
3. **Всегда возвращайте 200** даже при ошибках (Telegram требует)
4. **Логируйте все ошибки** для отладки
5. **Используйте транзакции** для генерации последовательных ID

---

## 🐛 Отладка

### Проверка логов

```bash
# PM2
pm2 logs telegram-bot

# systemd
journalctl -u telegram-bot -f

# Или просто вывод в консоль
```

### Проверка получения webhook

Добавьте в начало роута:

```javascript
router.post('/webhook', async (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body, null, 2));
  // ... остальной код
});
```

### Тестирование вручную

```bash
curl -X POST http://localhost:3000/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "channel_post": {
      "message_id": 123,
      "chat": {"id": -1003271699368},
      "caption": "📝 Тестовый товар\n💰 Цена: 10000 руб"
    }
  }'
```

---

## 📚 Дополнительная документация

- `BACKEND_WEBHOOK_IMPLEMENTATION.md` - полная реализация
- `BACKEND_NOTIFICATION_IMPLEMENTATION.md` - уведомления
- `WEBHOOK_SETUP_GUIDE.md` - настройка webhook

