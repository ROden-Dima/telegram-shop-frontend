# ✅ ВСЕ ГОТОВО! Инструкция по выполнению

## 🚀 Выполнение развертывания (2 минуты)

### Шаг 1: Откройте Putty

1. Запустите Putty
2. Введите:
   - **Host:** `194.87.0.193`
   - **Port:** `22`
3. Нажмите **Open**
4. Введите логин: `root`
5. Введите пароль: `6BFNsKPHU8`

### Шаг 2: Выполните команды

**Откройте файл:** `scripts/AUTO_DEPLOY_COMMANDS.txt`

**Скопируйте ВСЁ содержимое файла** (Ctrl+A, Ctrl+C)

**Вставьте в Putty** (правая кнопка мыши или Shift+Insert)

**Нажмите Enter**

---

## ✅ Что произойдет автоматически

1. ✅ Создадутся директории `routes/telegram` и `utils/telegram`
2. ✅ Создадутся все файлы webhook:
   - `routes/telegram/webhook.js`
   - `utils/telegram/parser.js`
   - `utils/telegram/api.js`
   - `utils/telegram/notifications.js`
3. ✅ Настроятся переменные окружения в `.env`
4. ✅ Будет найден главный файл приложения (если есть)

---

## ⚠️ Что нужно сделать вручную после выполнения

### 1. Интегрировать роут в главный файл

Найдите главный файл (`app.js`, `server.js`, `index.js`) и добавьте:

```javascript
const telegramWebhookRouter = require('./routes/telegram/webhook');
app.use('/api/telegram', telegramWebhookRouter);
```

### 2. Реализовать функции работы с БД

Откройте `routes/telegram/webhook.js` и замените заглушки на реальные функции:

- `getNextProductSequenceId()` - получение следующего последовательного ID
- `createProductFromTelegram()` - создание товара в БД
- `findCategoryByName()` - поиск категории

### 3. Обновить базу данных

```bash
mysql -u root -p your_database_name < scripts/update-database.sql
```

Или выполните SQL вручную (см. `scripts/update-database.sql`)

### 4. Настроить SSL для HTTPS

Webhook требует HTTPS. Настройте через Let's Encrypt:

```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### 5. Настроить webhook в Telegram

```bash
curl -X POST "https://api.telegram.org/bot7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "allowed_updates": ["channel_post", "edited_channel_post"]
  }'
```

### 6. Перезапустить приложение

```bash
pm2 restart telegram-bot
# или
systemctl restart telegram-bot
```

---

## 🧪 Тестирование

После выполнения всех шагов:

1. Отправьте сообщение в канал `-1003271699368`:
```
📝 Тестовый товар

💰 Цена: 10000 руб
```

2. Проверьте:
   - ✅ Логи приложения
   - ✅ База данных (товар создан)
   - ✅ Сообщение в канале (добавлен `#product_id`)
   - ✅ Канал уведомлений (пришло уведомление)

---

## 📚 Документация

- `EXECUTE_NOW.md` - быстрая инструкция
- `DEPLOYMENT_BACKEND.md` - полное руководство
- `BACKEND_READY.md` - чеклист развертывания
- `scripts/PUTTY_DEPLOY_INSTRUCTIONS.md` - детальная инструкция

---

**Файл для копирования:** `scripts/AUTO_DEPLOY_COMMANDS.txt`  
**Время выполнения скрипта:** ~30 секунд

