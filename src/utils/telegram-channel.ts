/**
 * Утилиты для работы с Telegram каналом для синхронизации товаров
 * 
 * Функционал:
 * 1. Парсинг сообщений из канала в структуру товара
 * 2. Извлечение данных из текста сообщения
 * 3. Обработка фотографий из сообщений
 * 
 * Формат сообщения в канале:
 * 📷 [Фото товара]
 * 
 * 📝 Описание товара
 * 💰 Цена: 15000 руб
 * 📦 Количество: 10 шт
 * 🏷️ Категория: Электроника
 * 📞 Контакт: @username или +1234567890
 * 
 * #product_id:12345
 */

export interface ParsedProduct {
  messageId: number;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  contact?: string;
  photoFileId?: string;
  photoUrl?: string;
  productId?: string;
}

/**
 * Парсит сообщение из Telegram канала и извлекает данные товара
 * 
 * @param message - Объект сообщения из Telegram Bot API
 * @returns Объект с распарсенными данными товара
 */
export function parseProductMessage(message: any): ParsedProduct | null {
  if (!message) {
    return null;
  }

  const result: ParsedProduct = {
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

  // Парсим описание (все что до первой эмодзи-метки)
  const descriptionMatch = text.match(/📝\s*(.+?)(?=\n(?:💰|📦|🏷️|📞|#)|$)/s);
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
  const priceMatch = text.match(/💰\s*Цена:\s*(\d+(?:\s*\d+)*)\s*руб/i);
  if (priceMatch) {
    // Убираем пробелы и преобразуем в число
    const priceStr = priceMatch[1].replace(/\s+/g, '');
    result.price = parseInt(priceStr, 10);
  }

  // Парсим количество
  const quantityMatch = text.match(/📦\s*Количество:\s*(\d+)\s*шт/i);
  if (quantityMatch) {
    result.quantity = parseInt(quantityMatch[1], 10);
  }

  // Парсим категорию
  const categoryMatch = text.match(/🏷️\s*Категория:\s*(.+?)(?=\n|$)/i);
  if (categoryMatch) {
    result.category = categoryMatch[1].trim();
  }

  // Парсим контакт
  const contactMatch = text.match(/📞\s*Контакт:\s*(.+?)(?=\n|$)/i);
  if (contactMatch) {
    result.contact = contactMatch[1].trim();
  }

  // Парсим product_id (если есть)
  const productIdMatch = text.match(/#product_id[:\s]*(\d+)/i);
  if (productIdMatch) {
    result.productId = productIdMatch[1];
  }

  return result;
}

/**
 * Форматирует данные товара в текст для публикации в канале
 * 
 * @param product - Данные товара
 * @returns Отформатированный текст для канала
 */
export function formatProductMessage(product: {
  description: string;
  price: number;
  quantity?: number;
  category?: string;
  contact?: string;
  productId?: number;
}): string {
  let text = `📝 ${product.description}\n\n`;
  
  if (product.price) {
    text += `💰 Цена: ${product.price.toLocaleString('ru-RU')} руб\n`;
  }
  
  if (product.quantity !== undefined) {
    text += `📦 Количество: ${product.quantity} шт\n`;
  }
  
  if (product.category) {
    text += `🏷️ Категория: ${product.category}\n`;
  }
  
  if (product.contact) {
    text += `📞 Контакт: ${product.contact}\n`;
  }
  
  if (product.productId) {
    text += `\n#product_id:${product.productId}`;
  }
  
  return text.trim();
}

/**
 * Валидирует распарсенные данные товара
 * 
 * @param parsed - Распарсенные данные
 * @returns true если данные валидны, false иначе
 */
export function validateParsedProduct(parsed: ParsedProduct): boolean {
  // Минимальные требования: описание и цена
  if (!parsed.description || !parsed.price) {
    return false;
  }
  
  // Проверяем что цена положительная
  if (parsed.price <= 0) {
    return false;
  }
  
  // Проверяем что количество положительное (если указано)
  if (parsed.quantity !== undefined && parsed.quantity < 0) {
    return false;
  }
  
  return true;
}

/**
 * Преобразует распарсенные данные в формат для API
 * 
 * @param parsed - Распарсенные данные из канала
 * @param userId - ID пользователя (администратора)
 * @param categoryIds - Массив ID категорий (если категория найдена)
 * @returns Данные в формате TypeProductPost
 */
export function convertToProductPost(
  parsed: ParsedProduct,
  userId: string,
  categoryIds: number[] = []
): any {
  return {
    product_name: parsed.description || '',
    description: parsed.description || '',
    price: parsed.price || 0,
    quantity: parsed.quantity || 0,
    category_ids: categoryIds,
    photos: [], // Фото будет загружено отдельно через API
    user_id: userId
  };
}

