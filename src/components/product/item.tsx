/* eslint-disable jsx-a11y/no-static-element-interactions */

// Импорт хука useState для управления состоянием (открытие/закрытие модального окна)
import { useState } from "react";

// Компонент карточки товара
// Получает данные через props (свойства) от родительского компонента
function ProductItem({
  title,              // Название товара (строка)
  price,              // Цена товара (число)
  discountedPrice,    // Цена со скидкой (число, если есть)
  imageURL,           // Ссылка на фото товара
  quantity,           // Количество на складе (число)
  product_Id,         // Уникальный идентификатор товара (число)
  pageType,           // Тип страницы: "admin" (админ-панель) или "user" (витрина)
  onClick,            // Функция, вызываемая при клике на карточку
  addCommas           // Функция для форматирования чисел (добавление пробелов между тысячами)
}: any) {
  
  // ===== БЕЗОПАСНОЕ ПОЛУЧЕНИЕ ЦЕН =====
  // Если цена не передана, используем 0
  const safePrice = price || 0;
  // Если цена со скидкой не передана, используем обычную цену
  const safeDiscountedPrice = discountedPrice || price || 0;
  
  // ===== ВЫЧИСЛЕНИЕ ПРОЦЕНТА СКИДКИ =====
  // Если есть скидка, считаем процент, иначе 0
  const finalPrice = discountedPrice ? Math.round((1 - discountedPrice / price) * 100) : 0;
  
  // ===== СОСТОЯНИЕ МОДАЛЬНОГО ОКНА =====
  // modalVisible: true = окно открыто, false = закрыто
  // setModalVisible: функция для изменения состояния
  const [modalVisible, setModalVisible] = useState(false);

  // ===== ОБРАБОТЧИК КЛИКА ПО КАРТОЧКЕ =====
  // Переходит на страницу товара (только для покупателей)
  const handleClick = () => {
    // Если есть функция onClick и это не админ-панель
    if (onClick && pageType !== "admin") {
      onClick(); // Вызываем функцию (переход на страницу товара)
    }
  };

  // ===== ОБРАБОТЧИК УДАЛЕНИЯ ТОВАРА =====
  // Используется только в админ-панели
  const handleDelete = async (e: any) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал клик по карточке
    
    // Спрашиваем подтверждение
    if (confirm('Удалить этот товар?')) {
      try {
        // Отправляем DELETE запрос на сервер
        const response = await fetch(`/api/products/${product_Id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        
        if (data.success) {
          alert('Товар удалён');
          window.location.reload(); // Перезагружаем страницу
        } else {
          alert('Ошибка: ' + data.message);
        }
      } catch (error) {
        alert('Ошибка при удалении');
      }
    }
  };

  // ===== ОБРАБОТЧИК РЕДАКТИРОВАНИЯ ТОВАРА =====
  // Используется только в админ-панели
  const handleEdit = (e: any) => {
    e.stopPropagation(); // Останавливаем всплытие
    // Переходим на страницу редактирования товара
    window.location.href = `/admin/products/edit/${product_Id}`;
  };

  // ===== ОТРИСОВКА КАРТОЧКИ ТОВАРА =====
  return (
    // Основной контейнер карточки
    <div
      onClick={handleClick}  // При клике на карточку (для покупателей)
      className={`flex flex-col w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md ${
        finalPrice && "border-orange-400"  // Если есть скидка, рамка оранжевая
      }`}
      style={{ minHeight: '280px' }}>
      
      {/* ============================================ */}
      {/* БЛОК 1: ФОТО ТОВАРА */}
      {/* ============================================ */}
      <div
        className="relative w-full bg-gray-100 bg-cover bg-center"
        style={{
          // Если есть фото — ставим как фон, иначе фон пустой
          backgroundImage: imageURL ? `url('${imageURL.startsWith('http') ? imageURL : `${import.meta.env.VITE_API_URL || ''}/${imageURL}`}')` : 'none',
          aspectRatio: '1 / 1',    // Квадратное фото (1:1)
          minHeight: '160px'       // Минимальная высота
        }}>
        
        {/* Бейдж со скидкой (показываем, если есть скидка) */}
        {finalPrice && (
          <span className="absolute top-2 right-2 rounded bg-orange-500 text-white px-2 py-1 text-xs font-semibold">
            -{finalPrice}%
          </span>
        )}
      </div>
      
      {/* ============================================ */}
      {/* БЛОК 2: ОПИСАНИЕ И ЦЕНА */}
      {/* ============================================ */}
      <div className="flex flex-col p-3 flex-grow justify-between">
        
        {/* Блок с названием товара */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
            {title}
          </p>
          
          {/* Количество на складе (показываем только в админ-панели) */}
          {pageType === "admin" && (
            <div className="text-xs text-gray-500">
              Количество: {quantity} шт
            </div>
          )}
        </div>
        
        {/* Блок с ценой */}
        <div className="flex flex-col gap-1 mt-2">
          {finalPrice ? (
            // === ЦЕНА СО СКИДКОЙ ===
            <>
              {/* Старая цена (зачёркнутая) */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 line-through">
                  {addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice} руб.
                </span>
              </div>
              {/* Новая цена (со скидкой) */}
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">
                  {addCommas && typeof addCommas === 'function' ? addCommas(safeDiscountedPrice) : safeDiscountedPrice}
                </span>
                <span className="text-sm text-gray-600">руб</span>
              </div>
            </>
          ) : (
            // === ЦЕНА БЕЗ СКИДКИ ===
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                {addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice}
              </span>
              <span className="text-sm text-gray-600">руб</span>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* БЛОК 3: КНОПКИ УПРАВЛЕНИЯ (ТОЛЬКО ДЛЯ АДМИНА) */}
        {/* ============================================ */}
        {pageType === "admin" && (
          <div className="flex gap-2 mt-3">
            {/* Кнопка "Редактировать" */}
            <button 
              onClick={handleEdit} 
              className="flex-1 bg-blue-500 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
            >
              Редактировать
            </button>
            {/* Кнопка "Удалить" */}
            <button 
              onClick={handleDelete} 
              className="flex-1 bg-red-500 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition"
            >
              Удалить
            </button>
          </div>
        )}

        {/* ============================================ */}
        {/* БЛОК 4: КНОПКА "КУПИТЬ" (ТОЛЬКО ДЛЯ ПОКУПАТЕЛЕЙ) */}
        {/* ============================================ */}
        {pageType !== "admin" && (
          <button 
            onClick={() => setModalVisible(true)}  // Открываем модальное окно
            className="w-full mt-3 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            Купить
          </button>
        )}

        {/* ============================================ */}
        {/* БЛОК 5: МОДАЛЬНОЕ ОКНО ЗАКАЗА */}
        {/* ============================================ */}
        {/* Показываем только если modalVisible = true */}
        {modalVisible && (
          <div style={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            background: 'white', 
            padding: '20px', 
            zIndex: 1000, 
            border: '1px solid #ccc', 
            borderRadius: '8px' 
          }}>
            <h3>Заказ: {title}</h3>
            <p>Цена: {safePrice} руб</p>
            <button 
              onClick={() => setModalVisible(false)} 
              style={{ background: '#f0f0f0', padding: '8px 16px', borderRadius: '4px' }}
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductItem;