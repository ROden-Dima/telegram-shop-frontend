# 📢 Система уведомлений - Краткая сводка

## 🎯 Требования

При публикации нового сообщения в канале товаров (`-1003271699368`):
1. ✅ Сообщению присваивается очередной последовательный ID
2. ✅ Уведомление с ссылкой отправляется в канал уведомлений (`-1003018207910`)
3. ✅ В уведомлении указывается наименование товара

---

## ✅ Что реализовано (Frontend)

### 1. Утилиты для уведомлений
**Файл:** `src/utils/telegram-notifications.ts`

**Функции:**
- `generateMessageLink()` - генерация ссылки на сообщение
- `formatProductNotification()` - форматирование уведомления о новом товаре
- `formatProductUpdateNotification()` - форматирование уведомления об обновлении
- `formatProductDeleteNotification()` - форматирование уведомления об удалении
- `generateNextProductId()` - генерация следующего ID (для справки)
- `extractProductIdFromMessage()` - извлечение ID из сообщения
- `addProductIdToMessage()` - добавление ID в сообщение

### 2. API для отправки уведомлений
**Файл:** `src/framework/api/telegram-channel/send-notification.ts`

**Hook:** `useSendTelegramNotification()`

### 3. Конфигурация каналов
```typescript
CHANNELS = {
  PRODUCTS: {
    CHAT_ID: '-1003271699368'
  },
  NOTIFICATIONS: {
    CHAT_ID: '-1003018207910',
    LINK: 'https://t.me/+vZtVvSSVltwzYmMy'
  }
}
```

---

## 📋 Формат уведомлений

### Новый товар
```
🆕 Новый товар #123

📦 Новый iPhone 15 Pro Max 256GB

🔗 https://t.me/c/3271699368/6
```

### Обновление товара
```
✏️ Товар обновлен #123

📦 Новый iPhone 15 Pro Max 256GB

🔗 https://t.me/c/3271699368/6
```

### Удаление товара
```
🗑️ Товар удален #123

📦 Новый iPhone 15 Pro Max 256GB
```

---

## 🔧 Что нужно на бэкенде

### 1. Генерация последовательных ID

**Вариант 1: AUTO_INCREMENT**
```sql
ALTER TABLE products 
ADD COLUMN product_sequence_id INT AUTO_INCREMENT UNIQUE;
```

**Вариант 2: Отдельная таблица счетчиков**
```sql
CREATE TABLE product_counters (
  id INT PRIMARY KEY,
  last_product_id INT DEFAULT 0
);
```

### 2. Endpoint для отправки уведомлений

**POST /api/telegram/send-notification**

См. `BACKEND_NOTIFICATION_IMPLEMENTATION.md` для полной реализации.

### 3. Интеграция в процесс создания товара

При создании товара из канала:
1. Получить следующий `product_sequence_id`
2. Создать товар
3. Обновить сообщение в канале, добавив `#product_id:{sequence_id}`
4. Отправить уведомление в канал уведомлений

---

## 📝 Пример работы

### Шаг 1: Публикация в канале товаров
Пользователь публикует сообщение в канале `-1003271699368`:
```
📝 Новый iPhone 15 Pro Max

💰 Цена: 150000 руб
📦 Количество: 5 шт
```

### Шаг 2: Webhook получает сообщение
Backend получает webhook от Telegram и:
1. Парсит сообщение
2. Присваивает `product_sequence_id = 1` (следующий номер)
3. Создает товар в базе данных

### Шаг 3: Обновление сообщения в канале
Backend обновляет сообщение, добавляя ID:
```
📝 Новый iPhone 15 Pro Max

💰 Цена: 150000 руб
📦 Количество: 5 шт

#product_id:1
```

### Шаг 4: Отправка уведомления
Backend отправляет уведомление в канал `-1003018207910`:
```
🆕 Новый товар #1

📦 Новый iPhone 15 Pro Max

🔗 https://t.me/c/3271699368/6
```

---

## 🔗 Ссылки на сообщения

**Формат:** `https://t.me/c/{chat_id}/{message_id}`

**Примеры:**
- Канал товаров: `https://t.me/c/3271699368/6`
- Канал уведомлений: `https://t.me/c/3018207910/123`

**Важно:** Убираем "-100" из начала chat_id для ссылки!

---

## 📚 Документация

- **Полная реализация:** `BACKEND_NOTIFICATION_IMPLEMENTATION.md`
- **Общая интеграция:** `TELEGRAM_CHANNEL_INTEGRATION.md`
- **Webhook:** `BACKEND_WEBHOOK_IMPLEMENTATION.md`

---

## ✅ Статус

**Frontend:** ✅ 100% готово  
**Backend:** ⏳ Требует реализации

Все функции созданы, документация полная. Осталось только реализовать на бэкенде согласно инструкциям.

---

**Последнее обновление:** 2025-01-XX

