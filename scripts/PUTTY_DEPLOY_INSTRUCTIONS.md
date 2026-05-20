# 🔧 Развертывание через Putty

## 📋 Инструкция

### Вариант 1: Автоматический (через plink)

1. **Убедитесь что Putty установлен** (plink.exe должен быть в PATH)

2. **Запустите скрипт:**
```cmd
scripts\deploy-via-putty.bat
```

Скрипт автоматически:
- Скопирует файлы на сервер
- Выполнит развертывание
- Проверит результат

### Вариант 2: Ручной (через Putty GUI)

#### Шаг 1: Подключение к серверу

1. Откройте Putty
2. Введите:
   - **Host Name:** `194.87.0.193`
   - **Port:** `22`
   - **Connection type:** SSH
3. Нажмите **Open**
4. Введите логин: `root`
5. Введите пароль: `6BFNsKPHU8`

#### Шаг 2: Копирование файлов

**Через WinSCP или другой SFTP клиент:**

1. Подключитесь к серверу (те же данные)
2. Скопируйте файлы:
   - `scripts/full-deploy.sh` → `/root/telegram-bot/`
   - `scripts/update-database.sql` → `/root/telegram-bot/scripts/`

**Или через командную строку (pscp):**

```cmd
pscp -pw 6BFNsKPHU8 scripts\full-deploy.sh root@194.87.0.193:/root/telegram-bot/
pscp -pw 6BFNsKPHU8 scripts\update-database.sql root@194.87.0.193:/root/telegram-bot/scripts/
```

#### Шаг 3: Выполнение на сервере

В Putty выполните:

```bash
cd /root/telegram-bot
chmod +x full-deploy.sh
./full-deploy.sh
```

#### Шаг 4: Интеграция роута

Найдите главный файл (`app.js`, `server.js`, `index.js`) и добавьте:

```javascript
const telegramWebhookRouter = require('./routes/telegram/webhook');
app.use('/api/telegram', telegramWebhookRouter);
```

#### Шаг 5: Реализация функций БД

Откройте `routes/telegram/webhook.js` и замените заглушки на реальные функции работы с вашей БД.

#### Шаг 6: Обновление базы данных

```bash
mysql -u root -p your_database_name < scripts/update-database.sql
```

#### Шаг 7: Настройка webhook

```bash
chmod +x scripts/setup-webhook.sh
./scripts/setup-webhook.sh
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

**⚠️ Важно:** URL должен быть HTTPS. Настройте SSL через Let's Encrypt.

#### Шаг 8: Перезапуск приложения

```bash
pm2 restart telegram-bot
# или
systemctl restart telegram-bot
```

---

## 🧪 Тестирование

После развертывания:

1. Отправьте сообщение в канал `-1003271699368`:
```
📝 Тестовый товар

💰 Цена: 10000 руб
```

2. Проверьте логи:
```bash
pm2 logs telegram-bot --lines 50
```

3. Проверьте базу данных
4. Проверьте сообщение в канале (должен добавиться `#product_id`)
5. Проверьте канал уведомлений (должно прийти уведомление)

---

## 📚 Дополнительная документация

- `DEPLOYMENT_BACKEND.md` - полное руководство
- `BACKEND_READY.md` - чеклист развертывания
- `QUICK_DEPLOY.md` - быстрый старт

