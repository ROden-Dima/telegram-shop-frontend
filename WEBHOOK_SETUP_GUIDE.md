# 🔧 Настройка Webhook для получения уведомлений

## ❌ Проблема

Сообщение опубликовано в канале товаров, но уведомление не пришло в канал уведомлений.

**Причина:** Webhook не настроен или не реализован на бэкенде.

---

## ✅ Решение

### Шаг 1: Проверка текущего состояния

Запустите скрипт проверки:
```bash
node scripts/check-channel-messages.js
```

Этот скрипт проверит:
- ✅ Есть ли сообщения в канале
- ✅ Является ли бот администратором канала
- ✅ Настроен ли webhook
- ✅ Есть ли ошибки в webhook

---

### Шаг 2: Реализация Webhook на бэкенде

Нужно создать endpoint на бэкенде:

**POST /api/telegram/webhook**

**Пример реализации (Node.js/Express):**

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PRODUCTS_CHANNEL_ID = -1003271699368;
const NOTIFICATIONS_CHANNEL_ID = -1003018207910;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Функции парсинга (из src/utils/telegram-channel.ts)
function parseProductMessage(message) {
  // ... логика парсинга
}

// Функция отправки уведомления
async function sendNotification(productName, productId, messageLink) {
  const text = `🆕 Новый товар #${productId}\n\n📦 ${productName}\n\n🔗 ${messageLink}`;
  
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: NOTIFICATIONS_CHANNEL_ID,
    text: text,
    parse_mode: 'Markdown',
    disable_web_page_preview: false
  });
}

// Webhook endpoint
router.post('/telegram/webhook', async (req, res) => {
  try {
    const { channel_post, edited_channel_post } = req.body;
    const message = channel_post || edited_channel_post;
    
    // Проверяем что сообщение из нужного канала
    if (!message || message.chat?.id !== PRODUCTS_CHANNEL_ID) {
      return res.status(200).json({ ok: true });
    }
    
    // Парсим сообщение
    const parsed = parseProductMessage(message);
    
    if (!parsed || !parsed.description || !parsed.price) {
      // Не товар или невалидные данные
      return res.status(200).json({ ok: true });
    }
    
    // Получаем следующий product_sequence_id
    const productSequenceId = await getNextProductId();
    
    // Создаем товар в базе данных
    const product = await createProductFromTelegram({
      ...parsed,
      product_sequence_id: productSequenceId,
      telegram_message_id: message.message_id
    });
    
    // Генерируем ссылку на сообщение
    const messageLink = `https://t.me/c/3271699368/${message.message_id}`;
    
    // Обновляем сообщение в канале, добавляя product_id
    const updatedCaption = addProductIdToMessage(
      message.caption || message.text || '',
      productSequenceId
    );
    
    await axios.post(`${TELEGRAM_API}/editMessageCaption`, {
      chat_id: PRODUCTS_CHANNEL_ID,
      message_id: message.message_id,
      caption: updatedCaption
    });
    
    // Отправляем уведомление в канал уведомлений
    await sendNotification(
      parsed.description,
      productSequenceId,
      messageLink
    );
    
    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    // Всегда возвращаем 200 для Telegram
    res.status(200).json({ ok: true });
  }
});

module.exports = router;
```

---

### Шаг 3: Настройка Webhook в Telegram

После создания endpoint на бэкенде, настройте webhook:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "allowed_updates": ["channel_post", "edited_channel_post"]
  }'
```

**Важно:**
- URL должен быть HTTPS
- URL должен быть доступен из интернета
- Бот должен быть администратором канала

---

### Шаг 4: Проверка Webhook

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

**Ожидаемый ответ:**
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0,
    "last_error_message": ""
  }
}
```

---

## 🔍 Диагностика проблем

### Проблема 1: Webhook не настроен

**Симптомы:**
- `getWebhookInfo` возвращает пустой `url`
- Сообщения не обрабатываются

**Решение:**
1. Создайте endpoint на бэкенде
2. Настройте webhook через `setWebhook`

### Проблема 2: Бот не администратор

**Симптомы:**
- `getChatMember` возвращает статус не "administrator"
- Сообщения не приходят в webhook

**Решение:**
1. Добавьте бота как администратора канала
2. Дайте права на редактирование сообщений

### Проблема 3: Webhook возвращает ошибки

**Симптомы:**
- `last_error_message` не пустой
- Сообщения не обрабатываются

**Решение:**
1. Проверьте логи бэкенда
2. Убедитесь что endpoint доступен
3. Проверьте что endpoint возвращает `{ ok: true }`

### Проблема 4: Сообщения не парсятся

**Симптомы:**
- Webhook получает сообщения
- Но товары не создаются

**Решение:**
1. Проверьте формат сообщения в канале
2. Убедитесь что есть описание и цена
3. Проверьте логи парсинга

---

## 📝 Чеклист настройки

- [ ] Бот добавлен как администратор канала `-1003271699368`
- [ ] Бот имеет права на редактирование сообщений
- [ ] Endpoint `/api/telegram/webhook` создан на бэкенде
- [ ] Endpoint доступен по HTTPS
- [ ] Webhook настроен через `setWebhook`
- [ ] `getWebhookInfo` показывает правильный URL
- [ ] Нет ошибок в `last_error_message`
- [ ] Протестировано отправкой сообщения в канал

---

## 🧪 Тестирование

1. **Отправьте тестовое сообщение в канал:**
```
📝 Тестовый товар

💰 Цена: 10000 руб
📦 Количество: 1 шт
```

2. **Проверьте логи бэкенда** - должен прийти webhook

3. **Проверьте канал уведомлений** - должно прийти уведомление

4. **Проверьте сообщение в канале** - должен добавиться `#product_id:1`

---

## 📚 Дополнительная документация

- `BACKEND_WEBHOOK_IMPLEMENTATION.md` - полная реализация webhook
- `BACKEND_NOTIFICATION_IMPLEMENTATION.md` - реализация уведомлений
- `TELEGRAM_CHANNEL_INTEGRATION.md` - общая интеграция

---

**Статус:** Требует реализации на бэкенде  
**Приоритет:** Высокий

