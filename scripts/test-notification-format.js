/**
 * Тестовый скрипт для проверки форматирования уведомлений
 * 
 * Использование:
 * node scripts/test-notification-format.js
 */

// Импортируем функции (упрощенная версия для Node.js)
function generateMessageLink(channelChatId, messageId) {
  const chatIdForLink = channelChatId.toString().replace(/^-100/, '');
  return `https://t.me/c/${chatIdForLink}/${messageId}`;
}

function formatProductNotification(productName, productId, messageLink) {
  return `🆕 Новый товар #${productId}\n\n📦 ${productName}\n\n🔗 ${messageLink}`;
}

function formatProductUpdateNotification(productName, productId, messageLink) {
  return `✏️ Товар обновлен #${productId}\n\n📦 ${productName}\n\n🔗 ${messageLink}`;
}

function formatProductDeleteNotification(productName, productId) {
  return `🗑️ Товар удален #${productId}\n\n📦 ${productName}`;
}

function addProductIdToMessage(messageText, productId) {
  const cleanedText = messageText.replace(/#product_id[:\s]*\d+/gi, '').trim();
  return `${cleanedText}\n\n#product_id:${productId}`;
}

// Тестовые данные
const testData = {
  channelChatId: '-1003271699368',
  messageId: 6,
  productName: 'Новый iPhone 15 Pro Max 256GB',
  productId: 1,
  originalMessage: `📝 Новый iPhone 15 Pro Max

💰 Цена: 150000 руб
📦 Количество: 5 шт
🏷️ Категория: Электроника`
};

console.log('🧪 Тестирование форматирования уведомлений\n');
console.log('='.repeat(80));

// Генерируем ссылку
const messageLink = generateMessageLink(testData.channelChatId, testData.messageId);
console.log('\n📎 Ссылка на сообщение:');
console.log(messageLink);

// Форматируем уведомления
console.log('\n📢 Уведомление о новом товаре:');
console.log('-'.repeat(80));
console.log(formatProductNotification(testData.productName, testData.productId, messageLink));

console.log('\n✏️ Уведомление об обновлении:');
console.log('-'.repeat(80));
console.log(formatProductUpdateNotification(testData.productName, testData.productId, messageLink));

console.log('\n🗑️ Уведомление об удалении:');
console.log('-'.repeat(80));
console.log(formatProductDeleteNotification(testData.productName, testData.productId));

// Добавляем ID в сообщение
console.log('\n📝 Исходное сообщение:');
console.log('-'.repeat(80));
console.log(testData.originalMessage);

console.log('\n📝 Сообщение с добавленным ID:');
console.log('-'.repeat(80));
console.log(addProductIdToMessage(testData.originalMessage, testData.productId));

console.log('\n' + '='.repeat(80));
console.log('✅ Тестирование завершено');

