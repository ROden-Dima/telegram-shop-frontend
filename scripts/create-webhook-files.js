/**
 * Скрипт для создания файлов webhook на бэкенде
 * Этот скрипт создаст все необходимые файлы для работы webhook
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/telegram-bot';
const ROUTES_DIR = path.join(PROJECT_ROOT, 'routes', 'telegram');
const UTILS_DIR = path.join(PROJECT_ROOT, 'utils', 'telegram');

// Создаем директории
[ROUTES_DIR, UTILS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Создана директория: ${dir}`);
  }
});

// 1. Парсер сообщений (utils/telegram/parser.js)
const parserCode = `/**
 * Парсер сообщений из Telegram канала
 * Портированная версия из frontend src/utils/telegram-channel.ts
 */

/**
 * Парсит сообщение из Telegram канала и извлекает данные товара
 */
function parseProductMessage(message) {
  if (!message) {
    return null;
  }

  const result = {
    messageId: message.message_id || message.messageId
  };

  // Извлекаем текст из caption (для сообщений с фото) или text
  const text = message.caption || message.text || '';
  
  if (!text && !message.photo) {
    // Сообщение без текста и фото - не товар
    return null;
  }

  // Извлекаем фото (берем самое большое)
  if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
    const largestPhoto = message.photo[message.photo.length - 1];
    result.photoFileId = largestPhoto.file_id;
  }

  // Парсим описание
  const descriptionMatch = text.match(/📝\\s*(.+?)(?=\\n(?:💰|📦|🏷️|📞|#)|$)/s);
  if (descriptionMatch) {
    result.description = descriptionMatch[1].trim();
  } else {
    // Если нет метки 📝, берем весь текст до первой метки
    const firstMarker = text.match(/(💰|📦|🏷️|📞|#)/);
    if (firstMarker) {
      result.description = text.substring(0, firstMarker.index).trim();
    } else {
      result.description = text.trim();
    }
  }

  // Парсим цену
  const priceMatch = text.match(/💰\\s*Цена:\\s*(\\d+(?:\\s*\\d+)*)\\s*руб/i);
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(/\\s+/g, '');
    result.price = parseInt(priceStr, 10);
  }

  // Парсим количество
  const quantityMatch = text.match(/📦\\s*Количество:\\s*(\\d+)\\s*шт/i);
  if (quantityMatch) {
    result.quantity = parseInt(quantityMatch[1], 10);
  }

  // Парсим категорию
  const categoryMatch = text.match(/🏷️\\s*Категория:\\s*(.+?)(?=\\n|$)/i);
  if (categoryMatch) {
    result.category = categoryMatch[1].trim();
  }

  // Парсим контакт
  const contactMatch = text.match(/📞\\s*Контакт:\\s*(.+?)(?=\\n|$)/i);
  if (contactMatch) {
    result.contact = contactMatch[1].trim();
  }

  // Парсим product_id (если есть)
  const productIdMatch = text.match(/#product_id[:\\s]*(\\d+)/i);
  if (productIdMatch) {
    result.productId = productIdMatch[1];
  }

  return result;
}

/**
 * Валидирует распарсенные данные товара
 */
function validateParsedProduct(parsed) {
  if (!parsed.description || !parsed.price) {
    return false;
  }
  
  if (parsed.price <= 0) {
    return false;
  }
  
  if (parsed.quantity !== undefined && parsed.quantity < 0) {
    return false;
  }
  
  return true;
}

/**
 * Добавляет product_id в сообщение
 */
function addProductIdToMessage(text, productId) {
  // Удаляем старый product_id если есть
  const cleaned = text.replace(/\\n?#product_id[:\\s]*\\d+\\s*/gi, '');
  
  // Добавляем новый
  return cleaned.trim() + '\\n\\n#product_id:' + productId;
}

/**
 * Генерирует ссылку на сообщение в канале
 */
function generateMessageLink(channelId, messageId) {
  // Убираем -100 из начала chat_id для ссылки
  const channelIdStr = channelId.toString().replace(/^-100/, '');
  return \`https://t.me/c/\${channelIdStr}/\${messageId}\`;
}

module.exports = {
  parseProductMessage,
  validateParsedProduct,
  addProductIdToMessage,
  generateMessageLink
};
`;

// 2. Утилиты для работы с Telegram API (utils/telegram/api.js)
const telegramApiCode = `/**
 * Утилиты для работы с Telegram Bot API
 */

const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = \`https://api.telegram.org/bot\${BOT_TOKEN}\`;

/**
 * Загружает фото из Telegram
 */
async function downloadPhotoFromTelegram(photoFileId) {
  try {
    // Получаем информацию о файле
    const fileResponse = await axios.get(\`\${TELEGRAM_API}/getFile\`, {
      params: { file_id: photoFileId }
    });
    
    const filePath = fileResponse.data.result.file_path;
    
    // Возвращаем URL фото (можно использовать напрямую или скачать)
    const photoUrl = \`https://api.telegram.org/file/bot\${BOT_TOKEN}/\${filePath}\`;
    
    return photoUrl;
  } catch (error) {
    console.error('Ошибка загрузки фото:', error);
    return null;
  }
}

/**
 * Обновляет подпись сообщения в канале
 */
async function editMessageCaption(channelId, messageId, caption) {
  try {
    const response = await axios.post(\`\${TELEGRAM_API}/editMessageCaption\`, {
      chat_id: channelId,
      message_id: messageId,
      caption: caption
    });
    
    return response.data.ok;
  } catch (error) {
    console.error('Ошибка обновления сообщения:', error);
    return false;
  }
}

/**
 * Отправляет сообщение в канал
 */
async function sendMessage(chatId, text, options = {}) {
  try {
    const response = await axios.post(\`\${TELEGRAM_API}/sendMessage\`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
      ...options
    });
    
    return response.data.ok ? response.data.result : null;
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    return null;
  }
}

/**
 * Настраивает webhook
 */
async function setWebhook(url) {
  try {
    const response = await axios.post(\`\${TELEGRAM_API}/setWebhook\`, {
      url: url,
      allowed_updates: ['channel_post', 'edited_channel_post']
    });
    
    return response.data.ok;
  } catch (error) {
    console.error('Ошибка настройки webhook:', error);
    return false;
  }
}

/**
 * Получает информацию о webhook
 */
async function getWebhookInfo() {
  try {
    const response = await axios.get(\`\${TELEGRAM_API}/getWebhookInfo\`);
    return response.data.result;
  } catch (error) {
    console.error('Ошибка получения информации о webhook:', error);
    return null;
  }
}

module.exports = {
  downloadPhotoFromTelegram,
  editMessageCaption,
  sendMessage,
  setWebhook,
  getWebhookInfo
};
`;

// 3. Утилиты для уведомлений (utils/telegram/notifications.js)
const notificationsCode = `/**
 * Утилиты для форматирования и отправки уведомлений
 */

const { sendMessage } = require('./api');
const { generateMessageLink } = require('./parser');

const NOTIFICATIONS_CHANNEL_ID = process.env.NOTIFICATIONS_CHANNEL_ID || '-1003018207910';

/**
 * Форматирует уведомление о новом товаре
 */
function formatNewProductNotification(productName, productId, messageLink) {
  return \`🆕 Новый товар #\${productId}\n\n📦 \${productName}\n\n🔗 \${messageLink}\`;
}

/**
 * Форматирует уведомление об обновлении товара
 */
function formatUpdatedProductNotification(productName, productId, messageLink) {
  return \`🔄 Товар обновлен #\${productId}\n\n📦 \${productName}\n\n🔗 \${messageLink}\`;
}

/**
 * Форматирует уведомление об удалении товара
 */
function formatDeletedProductNotification(productName, productId) {
  return \`🗑️ Товар удален #\${productId}\n\n📦 \${productName}\`;
}

/**
 * Отправляет уведомление о новом товаре
 */
async function sendNewProductNotification(productName, productId, channelId, messageId) {
  const messageLink = generateMessageLink(channelId, messageId);
  const text = formatNewProductNotification(productName, productId, messageLink);
  
  return await sendMessage(NOTIFICATIONS_CHANNEL_ID, text);
}

/**
 * Отправляет уведомление об обновлении товара
 */
async function sendUpdatedProductNotification(productName, productId, channelId, messageId) {
  const messageLink = generateMessageLink(channelId, messageId);
  const text = formatUpdatedProductNotification(productName, productId, messageLink);
  
  return await sendMessage(NOTIFICATIONS_CHANNEL_ID, text);
}

/**
 * Отправляет уведомление об удалении товара
 */
async function sendDeletedProductNotification(productName, productId) {
  const text = formatDeletedProductNotification(productName, productId);
  
  return await sendMessage(NOTIFICATIONS_CHANNEL_ID, text);
}

module.exports = {
  formatNewProductNotification,
  formatUpdatedProductNotification,
  formatDeletedProductNotification,
  sendNewProductNotification,
  sendUpdatedProductNotification,
  sendDeletedProductNotification
};
`;

// 4. Роут webhook (routes/telegram/webhook.js)
const webhookRouteCode = `/**
 * Webhook endpoint для получения событий от Telegram
 * POST /api/telegram/webhook
 */

const express = require('express');
const router = express.Router();
const { parseProductMessage, validateParsedProduct, addProductIdToMessage } = require('../../utils/telegram/parser');
const { editMessageCaption, downloadPhotoFromTelegram } = require('../../utils/telegram/api');
const { sendNewProductNotification, sendUpdatedProductNotification } = require('../../utils/telegram/notifications');
const { generateMessageLink } = require('../../utils/telegram/parser');

const PRODUCTS_CHANNEL_ID = process.env.PRODUCTS_CHANNEL_ID || '-1003271699368';
const NOTIFICATIONS_CHANNEL_ID = process.env.NOTIFICATIONS_CHANNEL_ID || '-1003018207910';

// Здесь нужно импортировать функции работы с БД
// const { createProduct, updateProduct, findProductByTelegramMessageId } = require('../../models/product');
// const { findCategoryByName } = require('../../models/category');
// const { getNextProductSequenceId } = require('../../models/product');

/**
 * Получает следующий последовательный ID товара
 * TODO: Реализовать на основе вашей БД
 */
async function getNextProductSequenceId() {
  // Пример для MySQL:
  // const result = await db.query('SELECT MAX(product_sequence_id) as max_id FROM products');
  // return (result[0]?.max_id || 0) + 1;
  
  // Временная заглушка
  return Math.floor(Math.random() * 1000) + 1;
}

/**
 * Создает товар из данных Telegram
 * TODO: Реализовать на основе вашей БД
 */
async function createProductFromTelegram(data) {
  // Пример:
  // const product = {
  //   product_name: data.description,
  //   description: data.description,
  //   price: data.price,
  //   quantity: data.quantity || 0,
  //   product_sequence_id: data.productSequenceId,
  //   telegram_message_id: data.messageId,
  //   telegram_channel_id: PRODUCTS_CHANNEL_ID,
  //   user_id: data.userId || process.env.ADMIN_USER_ID,
  //   category_ids: data.categoryIds || []
  // };
  // return await createProduct(product);
  
  console.log('Создание товара:', data);
  return { product_Id: 1, product_sequence_id: data.productSequenceId };
}

/**
 * Обновляет товар по telegram_message_id
 * TODO: Реализовать на основе вашей БД
 */
async function updateProductFromTelegram(messageId, data) {
  // Пример:
  // const product = await findProductByTelegramMessageId(messageId);
  // if (!product) return null;
  // return await updateProduct(product.product_Id, data);
  
  console.log('Обновление товара:', messageId, data);
  return { product_Id: 1 };
}

/**
 * Находит категорию по названию
 * TODO: Реализовать на основе вашей БД
 */
async function findCategoryByName(categoryName) {
  // Пример:
  // return await db.query('SELECT * FROM categories WHERE category_Name = ?', [categoryName]);
  
  console.log('Поиск категории:', categoryName);
  return null;
}

/**
 * Webhook endpoint
 */
router.post('/webhook', async (req, res) => {
  try {
    const { channel_post, edited_channel_post } = req.body;
    const message = channel_post || edited_channel_post;
    
    // Проверяем что сообщение из нужного канала
    if (!message || message.chat?.id?.toString() !== PRODUCTS_CHANNEL_ID.replace('-100', '')) {
      console.log('Сообщение не из нужного канала или отсутствует');
      return res.status(200).json({ ok: true });
    }
    
    console.log('Получено сообщение из канала:', message.message_id);
    
    // Парсим сообщение
    const parsed = parseProductMessage(message);
    
    if (!parsed || !validateParsedProduct(parsed)) {
      console.log('Сообщение не является товаром или невалидно');
      return res.status(200).json({ ok: true });
    }
    
    console.log('Распарсенные данные:', parsed);
    
    // Находим категорию по названию (если указана)
    let categoryIds = [];
    if (parsed.category) {
      const category = await findCategoryByName(parsed.category);
      if (category) {
        categoryIds = [category.category_Id || category.id];
      }
    }
    
    // Загружаем фото из Telegram
    let photoUrl = null;
    if (parsed.photoFileId) {
      photoUrl = await downloadPhotoFromTelegram(parsed.photoFileId);
      console.log('Фото загружено:', photoUrl);
    }
    
    // Получаем ID администратора
    const adminUserId = process.env.ADMIN_USER_ID || process.env.ADMIN_CHAT_ID || '1';
    
    // Обрабатываем новое сообщение или редактирование
    if (channel_post && !parsed.productId) {
      // Новое сообщение без product_id
      console.log('Создание нового товара...');
      
      // Получаем следующий последовательный ID
      const productSequenceId = await getNextProductSequenceId();
      
      // Создаем товар
      const product = await createProductFromTelegram({
        description: parsed.description,
        price: parsed.price,
        quantity: parsed.quantity || 0,
        categoryIds: categoryIds,
        photoUrl: photoUrl,
        photoFileId: parsed.photoFileId,
        userId: adminUserId,
        messageId: parsed.messageId,
        productSequenceId: productSequenceId,
        category: parsed.category,
        contact: parsed.contact
      });
      
      if (product) {
        // Обновляем сообщение в канале, добавляя product_id
        const currentCaption = message.caption || message.text || '';
        const updatedCaption = addProductIdToMessage(currentCaption, productSequenceId);
        
        await editMessageCaption(PRODUCTS_CHANNEL_ID, message.message_id, updatedCaption);
        console.log('Сообщение обновлено с product_id:', productSequenceId);
        
        // Отправляем уведомление
        const messageLink = generateMessageLink(PRODUCTS_CHANNEL_ID, message.message_id);
        await sendNewProductNotification(
          parsed.description,
          productSequenceId,
          PRODUCTS_CHANNEL_ID,
          message.message_id
        );
        console.log('Уведомление отправлено');
      }
      
    } else if (edited_channel_post || parsed.productId) {
      // Редактирование существующего товара
      console.log('Обновление товара...');
      
      const productId = parsed.productId || await findProductByTelegramMessageId(message.message_id);
      
      if (productId) {
        await updateProductFromTelegram(message.message_id, {
          description: parsed.description,
          price: parsed.price,
          quantity: parsed.quantity,
          categoryIds: categoryIds,
          photoUrl: photoUrl,
          photoFileId: parsed.photoFileId,
          category: parsed.category,
          contact: parsed.contact
        });
        
        // Отправляем уведомление об обновлении
        await sendUpdatedProductNotification(
          parsed.description,
          productId,
          PRODUCTS_CHANNEL_ID,
          message.message_id
        );
        console.log('Товар обновлен, уведомление отправлено');
      }
    }
    
    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    // Всегда возвращаем 200 для Telegram
    res.status(200).json({ ok: true });
  }
});

module.exports = router;
`;

// Записываем файлы
const files = [
  { path: path.join(UTILS_DIR, 'parser.js'), content: parserCode },
  { path: path.join(UTILS_DIR, 'api.js'), content: telegramApiCode },
  { path: path.join(UTILS_DIR, 'notifications.js'), content: notificationsCode },
  { path: path.join(ROUTES_DIR, 'webhook.js'), content: webhookRouteCode }
];

files.forEach(({ path: filePath, content }) => {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Создан файл: ${filePath}`);
});

console.log('\n✅ Все файлы созданы!');
console.log('\n📝 Следующие шаги:');
console.log('1. Интегрировать роут в основное приложение (app.js или server.js)');
console.log('2. Реализовать функции работы с БД (getNextProductSequenceId, createProductFromTelegram и т.д.)');
console.log('3. Настроить webhook через setWebhook');
console.log('4. Протестировать отправкой сообщения в канал');

