//* eslint-disable jsx-a11y/no-static-element-interactions */
import { Button } from "antd";

function ProductItem({
  title,
  price,
  discountedPrice,
  imageURL,
  quantity,
  product_Id,
  pageType,
  onClick,
  addCommas
}: any) {
  const safePrice = price || 0;
  const safeDiscountedPrice = discountedPrice || price || 0;
  const finalPrice = discountedPrice ? Math.round((1 - discountedPrice / price) * 100) : 0;

  const handleClick = () => {
    if (onClick && pageType !== "admin") {
      onClick();
    }
  };

  const handleDelete = async (e: any) => {
    e.stopPropagation();
    console.log('Удаляем товар с ID:', product_Id, 'тип:', typeof product_Id);
    if (confirm('Удалить этот товар?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/products/${product_Id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        console.log('Ответ сервера:', data);
        if (data.success) {
          alert('Товар удалён');
          window.location.reload();
        } else {
          alert('Ошибка: ' + data.message);
        }
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    window.location.href = `/admin/products/edit/${product_Id}`;
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md ${
        finalPrice && "border-orange-400"
      }`}
      style={{ minHeight: '280px' }}>
      {/* Картинка сверху */}
      <div
        className="relative w-full bg-gray-100 bg-cover bg-center"
        style={{
          backgroundImage: imageURL ? `url('${imageURL.startsWith('http') ? imageURL : `${import.meta.env.VITE_API_URL || ''}/${imageURL}`}')` : 'none',
          aspectRatio: '1 / 1',
          minHeight: '160px'
        }}>
        {finalPrice && (
          <span className="absolute top-2 right-2 rounded bg-orange-500 text-white px-2 py-1 text-xs font-semibold">
            -{finalPrice}%
          </span>
        )}
      </div>
      
      {/* Описание снизу */}
      <div className="flex flex-col p-3 flex-grow justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
            {title}
          </p>
          
          {pageType === "admin" && (
            <div className="text-xs text-gray-500">
              Количество: {quantity} шт
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1 mt-2">
          {finalPrice ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 line-through">
                  {addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice} руб.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">
                  {addCommas && typeof addCommas === 'function' ? addCommas(safeDiscountedPrice) : safeDiscountedPrice}
                </span>
                <span className="text-sm text-gray-600">руб</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                {addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice}
              </span>
              <span className="text-sm text-gray-600">руб</span>
            </div>
          )}
        </div>

        {/* ===== КНОПКИ ДЛЯ АДМИН-ПАНЕЛИ ===== */}
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
        {/* ===== КОНЕЦ КНОПОК ===== */}
      </div>
    </div>
  );
}

export default ProductItem;