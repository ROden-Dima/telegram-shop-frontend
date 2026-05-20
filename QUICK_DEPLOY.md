# ⚡ Быстрое развертывание Webhook на сервере

## 🚀 Автоматическое развертывание (рекомендуется)

### На вашем компьютере:

```bash
# 1. Скопируйте все необходимые файлы на сервер
scp scripts/create-webhook-files.js root@194.87.0.193:/root/telegram-bot/
scp scripts/update-database.sql root@194.87.0.193:/root/telegram-bot/
scp scripts/setup-webhook.sh root@194.87.0.193:/root/telegram-bot/
scp scripts/deploy-backend-complete.sh root@194.87.0.193:/root/telegram-bot/

# 2. Подключитесь к серверу
ssh root@194.87.0.193
# Пароль: 6BFNsKPHU8
```

### На сервере:

```bash
# 1. Перейдите в директорию проекта
cd /root/telegram-bot

# 2. Запустите скрипт развертывания
chmod +x deploy-backend-complete.sh
./deploy-backend-complete.sh
```

Скрипт автоматически:
- ✅ Создаст директории
- ✅ Создаст все файлы webhook
- ✅ Проверит переменные окружения
- ✅ Настроит webhook в Telegram

**Но вам нужно будет вручную:**
1. Интегрировать роут в главный файл приложения
2. Реализовать функции работы с БД
3. Обновить базу данных
4. Настроить SSL для HTTPS

---

## 📝 Ручное развертывание

### Шаг 1: Создание файлов

```bash
cd /root/telegram-bot
node scripts/create-webhook-files.js
```

### Шаг 2: Интеграция роута

Найдите `app.js` (или `server.js`, `index.js`) и добавьте:

```javascript
const telegramWebhookRouter = require('./routes/telegram/webhook');
app.use('/api/telegram', telegramWebhookRouter);
```

### Шаг 3: Реализация функций БД

В `routes/telegram/webhook.js` замените заглушки на реальные функции.

### Шаг 4: Обновление БД

```bash
mysql -u root -p your_database_name < scripts/update-database.sql
```

### Шаг 5: Настройка webhook

```bash
chmod +x scripts/setup-webhook.sh
./scripts/setup-webhook.sh
```

### Шаг 6: Перезапуск

```bash
pm2 restart telegram-bot
```

---

## ⚠️ Важно

1. **HTTPS обязателен** - настройте SSL через Let's Encrypt
2. **Бот должен быть администратором** обоих каналов
3. **Реализуйте функции БД** - заглушки не работают

---

## 🧪 Тестирование

После развертывания отправьте сообщение в канал `-1003271699368`:

```
📝 Тестовый товар

💰 Цена: 10000 руб
```

Проверьте:
- ✅ Логи приложения
- ✅ База данных (товар создан)
- ✅ Сообщение в канале (добавлен `#product_id`)
- ✅ Канал уведомлений (пришло уведомление)

---

## 📚 Детальная документация

- `DEPLOYMENT_BACKEND.md` - полное руководство
- `scripts/backend-integration-guide.md` - пошаговая инструкция

