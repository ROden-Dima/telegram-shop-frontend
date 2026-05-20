# Руководство по тестированию интеграции с Telegram каналом

## Статус тестирования

✅ **Выполнено:**
- Бот подключен и является администратором канала
- Тестовое сообщение успешно отправлено в канал (ID: 9)
- Созданы PowerShell скрипты для тестирования без Node.js
- Frontend API готов для работы с каналом
- Обновлен `.env` с правильным API URL

⚠️ **Требует реализации:**
- Backend endpoints `/api/channel/*` на сервере 194.87.0.193
- Webhook для автоматической обработки новых сообщений

## Быстрый старт

### 1. Проверка Telegram канала

```powershell
cd D:\WebApp\telegram-web-app-shop-local
powershell -ExecutionPolicy Bypass -File scripts\test-telegram-api.ps1
```

Этот скрипт проверяет:
- ✅ Информацию о боте
- ✅ Права бота в канале
- ✅ Последние сообщения
- ✅ Статус webhook

### 2. Отправка тестового сообщения

```powershell
powershell -ExecutionPolicy Bypass -File scripts\send-test-message.ps1
```

Отправляет тестовое сообщение с товаром в канал.

### 3. Получение конкретного сообщения

```powershell
powershell -ExecutionPolicy Bypass -File scripts\get-message-by-id.ps1 -MessageId 9
```

Получает и парсит сообщение по ID.

### 4. Полный цикл тестирования

```powershell
powershell -ExecutionPolicy Bypass -File scripts\test-full-cycle.ps1
```

Тестирует весь цикл: получение сообщения → парсинг → проверка backend.

## Структура тестирования

### Шаг 1: Проверка канала

**Цель:** Убедиться, что бот имеет доступ к каналу и может читать сообщения.

**Команда:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\test-telegram-api.ps1
```

**Ожидаемый результат:**
- Бот является администратором
- Канал доступен
- Webhook настроен (или готов к настройке)

### Шаг 2: Отправка тестового сообщения

**Цель:** Создать тестовое сообщение для проверки парсинга.

**Команда:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\send-test-message.ps1
```

**Формат сообщения:**
```
New iPhone 15 Pro Max 256GB in excellent condition

Price: 150000 toman
Quantity: 5 pcs
Category: Electronics
Contact: @seller_username
```

**Ожидаемый результат:**
- Сообщение отправлено успешно
- Получен Message ID

### Шаг 3: Парсинг сообщения

**Цель:** Проверить, что парсер корректно извлекает данные из сообщения.

**Команда:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\get-message-by-id.ps1 -MessageId <ID>
```

**Ожидаемый результат:**
- Сообщение найдено
- Данные распарсены:
  - ✅ Описание
  - ✅ Цена
  - ✅ Количество (опционально)
  - ✅ Категория (опционально)
  - ✅ Контакт (опционально)

### Шаг 4: Проверка Backend API

**Цель:** Убедиться, что backend готов к обработке запросов.

**Проверка:**
```powershell
Invoke-WebRequest -Uri "http://194.87.0.193/" -UseBasicParsing
```

**Требуемые endpoints:**
- `POST /api/channel/sync` - синхронизация сообщений из канала
- `POST /api/channel/parse-post` - парсинг сообщения
- `POST /api/channel/publish-product` - публикация товара в магазин
- `GET /api/channel/sync-settings` - получение настроек синхронизации

### Шаг 5: Тестирование через Frontend

**Цель:** Проверить работу через WebApp интерфейс.

1. Открыть WebApp в Telegram: `https://celadon-starburst-162af0.netlify.app`
2. Перейти в раздел "Канал" (`/bot/channel`)
3. Настроить канал:
   - Channel ID: `-1003271699368`
   - Включить авто-синхронизацию
4. Нажать "Синхронизировать сейчас"
5. Выбрать сообщение и нажать "Добавить в магазин"

## Формат сообщений в канале

Для корректного парсинга сообщения должны содержать:

### Обязательные поля:
- **Описание товара** (первая строка или после 📝)
- **Цена** в формате: `Price: <число> toman` или `💰 Цена: <число> руб`

### Опциональные поля:
- **Количество**: `Quantity: <число> pcs` или `📦 Количество: <число> шт`
- **Категория**: `Category: <название>` или `🏷️ Категория: <название>`
- **Контакт**: `Contact: @username` или `📞 Контакт: @username`
- **Фото**: прикрепленное изображение

### Пример корректного сообщения:

```
New iPhone 15 Pro Max 256GB in excellent condition

Price: 150000 toman
Quantity: 5 pcs
Category: Electronics
Contact: @seller_username
```

Или с эмодзи:

```
📝 Новый iPhone 15 Pro Max 256GB в отличном состоянии

💰 Цена: 150000 руб
📦 Количество: 5 шт
🏷️ Категория: Электроника
📞 Контакт: @seller_username
```

## Логирование

Все скрипты логируют свои действия:

- `scripts\channel-integration-steps.log` - детальные логи получения сообщений
- `scripts\channel-message-<ID>.json` - результаты парсинга конкретного сообщения
- `scripts\test-results.json` - результаты комплексного тестирования

## Troubleshooting

### Проблема: Сообщения не видны через getUpdates

**Причина:** `getUpdates` возвращает только сообщения, которые пришли после того, как бот начал слушать.

**Решение:**
- Использовать webhook для автоматической обработки
- Или пересылать сообщения боту для обработки

### Проблема: Backend endpoints не работают

**Причина:** Endpoints еще не реализованы на сервере.

**Решение:** 
- Реализовать endpoints согласно `CHANNEL_INTEGRATION.md`
- Или использовать локальный backend для тестирования

### Проблема: Парсер не находит данные

**Причина:** Формат сообщения не соответствует ожидаемому.

**Решение:**
- Проверить формат сообщения
- Убедиться, что используются правильные маркеры (Price, Quantity, etc.)
- Проверить кодировку текста

## Следующие шаги

1. ✅ Тестирование канала и отправка сообщений - **ВЫПОЛНЕНО**
2. ⏳ Реализация backend endpoints на сервере
3. ⏳ Настройка webhook для автоматической обработки
4. ⏳ Тестирование полного цикла: сообщение → парсинг → публикация
5. ⏳ Проверка отображения товаров в магазине

## Полезные команды

```powershell
# Проверка сервера
Invoke-WebRequest -Uri "http://194.87.0.193/" -UseBasicParsing

# Проверка канала
powershell -ExecutionPolicy Bypass -File scripts\test-telegram-api.ps1

# Отправка тестового сообщения
powershell -ExecutionPolicy Bypass -File scripts\send-test-message.ps1

# Получение сообщения по ID
powershell -ExecutionPolicy Bypass -File scripts\get-message-by-id.ps1 -MessageId 9

# Полный цикл тестирования
powershell -ExecutionPolicy Bypass -File scripts\test-full-cycle.ps1
```

## Контакты и настройки

- **Бот:** @JARVIS_SHEVA_bot
- **Канал ID:** -1003271699368
- **Канал название:** Магазин в ТГ
- **Backend URL:** http://194.87.0.193
- **Frontend URL:** https://celadon-starburst-162af0.netlify.app

---

_Последнее обновление: 2025-11-19_
