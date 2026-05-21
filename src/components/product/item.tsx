/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState } from "react";

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
  const [modalVisible, setModalVisible] = useState(false);

  const handleClick = () => {
    if (onClick && pageType !== "admin") {
      onClick();
    }
  };

  const handleDelete = async (e: any) => {
    e.stopPropagation();
    if (confirm('Удалить этот товар?')) {
      try {
        const response = await fetch(`/api/products/${product_Id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          alert('Товар удалён');
          window.location.reload();
        } else {
          alert('Ошибка: ' + data.message);
        }
      } catch (error) {
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

        {pageType === "admin" && (
          <div className="flex gap-2 mt-3">
            <button onClick={handleEdit} className="flex-1 bg-blue-500 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
              Редактировать
            </button>
            <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition">
              Удалить
            </button>
          </div>
        )}

        {pageType !== "admin" && (
          <button onClick={() => setModalVisible(true)} className="w-full mt-3 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition">
            Купить
          </button>
        )}

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
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>
                🛒 Добавить в корзину
              </h3>
              
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
              
              <div style={{ marginBottom: '20px' }}>
  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
    Количество:
  </label>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
    <button onClick={() => {
      const input = document.getElementById('quantityInput') as HTMLInputElement;
      if (input) input.value = Math.max(1, parseInt(input.value) - 1).toString();
    }} style={{ width: '40px', height: '40px', fontSize: '20px', background: '#e9ecef', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>−</button>
    
    <input 
      id="quantityInput" 
      type="number" 
      min="1" 
      max="99" 
      defaultValue="1" 
      style={{ 
        width: '80px', 
        height: '40px', 
        textAlign: 'center',
        padding: '0',
        MozAppearance: 'textfield',
        fontSize: '16px', 
        border: '1px solid #ccc', 
        borderRadius: '10px' 
      }} 
    />
    
    <button onClick={() => {
      const input = document.getElementById('quantityInput') as HTMLInputElement;
      if (input) input.value = Math.min(99, parseInt(input.value) + 1).toString();
    }} style={{ width: '40px', height: '40px', fontSize: '20px', background: '#e9ecef', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>+</button>
  </div>
</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => {
                  const input = document.getElementById('quantityInput') as HTMLInputElement;
                  const qty = parseInt(input?.value || '1');
                  alert(`Товар "${title}" в количестве ${qty} шт добавлен в корзину`);
                  setModalVisible(false);
                }} style={{ padding: '14px', background: '#2c7da0', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
                  🛍️ В корзину
                </button>
                <button onClick={() => {
                  const input = document.getElementById('quantityInput') as HTMLInputElement;
                  const qty = parseInt(input?.value || '1');
                  alert(`Товар "${title}" в количестве ${qty} шт добавлен в корзину`);
                  setModalVisible(false);
                }} style={{ padding: '14px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer' }}>
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