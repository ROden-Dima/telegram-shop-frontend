/* eslint-disable jsx-a11y/no-static-element-interactions */

// ============================================================
// 1. ИМПОРТЫ
// ============================================================
// Импортируем хук useState для управления состоянием (открыто/закрыто модальное окно)
import { useState } from "react";

// ============================================================
// 2. КОМПОНЕНТ КАРТОЧКИ ТОВАРА
// ============================================================
// Компонент получает данные через props (свойства) от родителя
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
  
  // ============================================================
  // 3. БЕЗОПАСНОЕ ПОЛУЧЕНИЕ ЦЕН
  // ============================================================
  const safePrice = price || 0;                     // Если цена не передана — 0
  const safeDiscountedPrice = discountedPrice || price || 0;  // Цена со скидкой или обычная
  
  // ============================================================
  // 4. ВЫЧИСЛЕНИЕ ПРОЦЕНТА СКИДКИ
  // ============================================================
  // Если есть скидка, считаем процент, иначе 0
  const finalPrice = discountedPrice ? Math.round((1 - discountedPrice / price) * 100) : 0;
  
  // ============================================================
  // 5. СОСТОЯНИЕ МОДАЛЬНОГО ОКНА
  // ============================================================
  // modalVisible: true = окно открыто, false = закрыто
  const [modalVisible, setModalVisible] = useState(false);

  // ============================================================
  // 6. ОБРАБОТЧИК КЛИКА ПО КАРТОЧКЕ
  // ============================================================
  // Переходит на страницу товара (только для покупателей)
  const handleClick = () => {
    // Если есть функция onClick и это не админ-панель
    if (onClick && pageType !== "admin") {
      onClick(); // Вызываем функцию (переход на страницу товара)
    }
  };

  // ============================================================
  // 7. ОБРАБОТЧИК УДАЛЕНИЯ ТОВАРА
  // ============================================================
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
          window.location.reload(); // Перезагружаем страницу после удаления
        } else {
          alert('Ошибка: ' + data.message);
        }
      } catch (error) {
        alert('Ошибка при удалении');
      }
    }
  };

  // ============================================================
  // 8. ОБРАБОТЧИК РЕДАКТИРОВАНИЯ ТОВАРА
  // ============================================================
  // Переход на страницу редактирования (только для админ-панели)
  const handleEdit = (e: any) => {
    e.stopPropagation(); // Останавливаем всплытие
    window.location.href = `/admin/products/edit/${product_Id}`;
  };

  // ============================================================
  // 9. ОТРИСОВКА КАРТОЧКИ ТОВАРА (JSX)
  // ============================================================
  return (
    // Основной контейнер карточки
    // При клике — срабатывает handleClick (переход на страницу товара)
    <div
      onClick={handleClick}
      className={`flex flex-col w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md ${
        finalPrice && "border-orange-400"  // Если есть скидка, рамка оранжевая
      }`}
      style={{ minHeight: '280px' }}>
      
      // ============================================================
      // 9.1. БЛОК С ФОТО ТОВАРА
      // ============================================================
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
      
      // ============================================================
      // 9.2. БЛОК С ОПИСАНИЕМ И ЦЕНОЙ
      // ============================================================
      <div className="flex flex-col p-3 flex-grow justify-between">
        
        {/* Название товара */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
            {title}
          </p>
          
          {/* Количество на складе (только для админ-панели) */}
          {pageType === "admin" && (
            <div className="text-xs text-gray-500">
              Количество: {quantity} шт
            </div>
          )}
        </div>
        
        {/* ===== БЛОК ЦЕНЫ ===== */}
        <div className="flex flex-col gap-1 mt-2">
          {finalPrice ? (
            // --- ЦЕНА СО СКИДКОЙ ---
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
            // --- ЦЕНА БЕЗ СКИДКИ ---
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                {addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice}
              </span>
              <span className="text-sm text-gray-600">руб</span>
            </div>
          )}
        </div>

        // ============================================================
        // 9.3. КНОПКИ ДЛЯ АДМИН-ПАНЕЛИ
        // ============================================================
        // Показываем только если pageType === "admin"
        {pageType === "admin" && (
          <div className="flex gap-2 mt-3">
            <button 
              onClick={handleEdit} 
              className="flex-1 bg-blue-500 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
            >
              Редактировать
            </button>
            <button 
              onClick={handleDelete} 
              className="flex-1 bg-red-500 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition"
            >
              Удалить
            </button>
          </div>
        )}

        // ============================================================
        // 9.4. КНОПКА "КУПИТЬ" ДЛЯ ПОКУПАТЕЛЕЙ
        // ============================================================
        // Показываем только если pageType !== "admin" (то есть для пользователей)
        {pageType !== "admin" && (
          <button 
            onClick={() => setModalVisible(true)}  // Открываем модальное окно
            className="w-full mt-3 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            Купить
          </button>
        )}

        // ============================================================
        // 9.5. МОДАЛЬНОЕ ОКНО С ВЫБОРОМ КОЛИЧЕСТВА
        // ============================================================
        // Показываем только если modalVisible = true
        {modalVisible && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '380px',
              boxShadow: '0 20px 35px rgba(0,0,0,0.2)'
            }}>
              
              {/* Заголовок модального окна */}
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>
                🛒 Добавить в корзину
              </h3>
              
              {/* Информация о товаре */}
              <div style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c7da0' }}>{safePrice} ₽</div>
              </div>
              
              {/* Выбор количества с кнопками + и - */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Количество:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                  {/* Кнопка "минус" — уменьшаем количество */}
                  <button 
                    onClick={() => {
                      const input = document.getElementById('quantityInput') as HTMLInputElement;
                      if (input) input.value = Math.max(1, parseInt(input.value) - 1).toString();
                    }} 
                    style={{ width: '40px', height: '40px', fontSize: '20px', background: '#e9ecef', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>−</button>
                  
                  {/* Поле ввода количества */}
                  <input 
                    id="quantityInput" 
                    type="number" 
                    min="1" 
                    max="99" 
                    defaultValue="1" 
                    style={{ width: '70px', height: '40px', textAlign: 'center', fontSize: '16px', border: '1px solid #ccc', borderRadius: '10px' }} 
                  />
                  
                  {/* Кнопка "плюс" — увеличиваем количество */}
                  <button 
                    onClick={() => {
                      const input = document.getElementById('quantityInput') as HTMLInputElement;
                      if (input) input.value = Math.min(99, parseInt(input.value) + 1).toString();
                    }} 
                    style={{ width: '40px', height: '40px', fontSize: '20px', background: '#e9ecef', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>+</button>
                </div>
              </div>
              
              {/* Кнопки действий */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Кнопка "В корзину" — добавляет и переходит в корзину */}
                <button 
                  onClick={() => {
                    const input = document.getElementById('quantityInput') as HTMLInputElement;
                    const qty = parseInt(input?.value || '1');
                    alert(`Товар "${title}" в количестве ${qty} шт добавлен в корзину`);
                    setModalVisible(false);
                  }} 
                  style={{ padding: '14px', background: '#2c7da0', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
                  🛍️ В корзину
                </button>
                
                {/* Кнопка "Продолжить покупки" — добавляет и закрывает окно */}
                <button 
                  onClick={() => {
                    const input = document.getElementById('quantityInput') as HTMLInputElement;
                    const qty = parseInt(input?.value || '1');
                    alert(`Товар "${title}" в количестве ${qty} шт добавлен в корзину`);
                    setModalVisible(false);
                  }} 
                  style={{ padding: '14px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer' }}>
                  🛍️ Продолжить покупки
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductItem;