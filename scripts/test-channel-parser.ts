/**
 * Тестовый скрипт для проверки парсера сообщений из Telegram канала
 * 
 * Использование:
 * npx ts-node scripts/test-channel-parser.ts
 * 
 * Или через Node.js:
 * node --loader ts-node/esm scripts/test-channel-parser.ts
 */

import { parseProductMessage, formatProductMessage, validateParsedProduct } from '../src/utils/telegram-channel';

// Тестовые сообщения
const testMessages = [
  // Полное сообщение со всеми полями
  {
    message_id: 123,
    photo: [
      { file_id: 'photo_small', width: 90, height: 90 },
      { file_id: 'photo_medium', width: 320, height: 320 },
      { file_id: 'photo_large', width: 1280, height: 1280 }
    ],
    caption: `📝 Новый iPhone 15 Pro Max 256GB в отличном состоянии

💰 Цена: 150000 руб
📦 Количество: 5 шт
🏷️ Категория: Электроника
📞 Контакт: @seller_username

#product_id:12345`
  },
  
  // Минимальное сообщение (только описание и цена)
  {
    message_id: 124,
    text: `📝 Простой товар без фото

💰 Цена: 5000 руб`
  },
  
  // Сообщение с большими числами
  {
    message_id: 125,
    caption: `📝 Дорогой товар

💰 Цена: 1 500 000 руб
📦 Количество: 1 шт`
  },
  
  // Невалидное сообщение (без цены)
  {
    message_id: 126,
    text: `📝 Товар без цены

📦 Количество: 10 шт`
  }
];

console.log('🧪 Тестирование парсера сообщений из Telegram канала\n');
console.log('='.repeat(80));

testMessages.forEach((message, index) => {
  console.log(`\n📨 Тест ${index + 1}:`);
  console.log('-'.repeat(80));
  
  const parsed = parseProductMessage(message);
  
  if (parsed) {
    console.log('✅ Сообщение распарсено:');
    console.log(JSON.stringify(parsed, null, 2));
    
    const isValid = validateParsedProduct(parsed);
    console.log(`\n${isValid ? '✅' : '❌'} Валидация: ${isValid ? 'ПРОШЛА' : 'НЕ ПРОШЛА'}`);
    
    if (isValid) {
      console.log('\n📤 Отформатированное сообщение:');
      console.log(formatProductMessage({
        description: parsed.description || '',
        price: parsed.price || 0,
        quantity: parsed.quantity,
        category: parsed.category,
        contact: parsed.contact,
        productId: parsed.productId ? parseInt(parsed.productId) : undefined
      }));
    }
  } else {
    console.log('❌ Сообщение не распознано как товар');
  }
  
  console.log('-'.repeat(80));
});

console.log('\n' + '='.repeat(80));
console.log('✅ Тестирование завершено');

