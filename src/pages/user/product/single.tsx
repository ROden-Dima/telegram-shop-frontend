/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable radix */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable camelcase */
/* eslint-disable object-curly-newline */
import {
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";
import Container from "@components/container";
import UserSingleProductSkeleton from "@components/skeleton/user-single-product";
import useAddToCart from "@framework/api/cart/add";
import { useGetProductsById } from "@framework/api/product/get-by-id";
import useTelegramUser from "@hooks/useTelegramUser";
import { addCommas } from "@persian-tools/persian-tools";
import {
  Alert,
  Button,
  Carousel,
  Image,
  InputNumber,
  Tabs,
  message
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

function ProductSingle() {
  const [count, setCount] = useState(1);
  const { product_id } = useParams();
  const mutation = useAddToCart();
  const telegramUser = useTelegramUser();
  const id = telegramUser?.id;
  const { data, isLoading, refetch, isFetching } = useGetProductsById({
    product_id: product_id || 0
  });
  // const [cartItems, setCartItems] = useAtom(userCartItems);
  useEffect(() => {
    if (refetch && typeof refetch === 'function') {
      refetch();
    }
  }, [refetch]);

  const onChange = (key: string) => {
    console.log(key);
  };

  const handleAddToCart = () => {
    // Проверка всех необходимых данных
    if (!id) {
      message.error("Ошибка: не удалось определить пользователя");
      return;
    }
    
    // Проверка product_id из URL
    if (!product_id) {
      console.error('product_id is undefined from useParams');
      message.error("Ошибка: неверный ID товара");
      return;
    }
    
    // Преобразование product_id в число
    const productIdNum = typeof product_id === 'string' ? parseInt(product_id, 10) : Number(product_id);
    
    if (isNaN(productIdNum) || productIdNum <= 0) {
      console.error('Invalid product_id:', product_id, 'parsed as:', productIdNum);
      message.error("Ошибка: неверный ID товара");
      return;
    }
    
    // Использовать product_Id из данных, если доступен
    const finalProductId = data?.product_Id || productIdNum;
    
    if (!finalProductId || finalProductId <= 0) {
      console.error('Invalid finalProductId:', finalProductId);
      message.error("Ошибка: неверный ID товара");
      return;
    }
    
    if (!mutation || typeof mutation.mutate !== 'function') {
      message.error("Ошибка: функция добавления недоступна");
      return;
    }
    
    if (count <= 0 || count > 100) {
      message.error("Ошибка: неверное количество");
      return;
    }
    
    try {
      mutation.mutate(
        {
          user_id: `${id}`,
          cart_items: [
            {
              product_id: finalProductId,
              quantity: count
            }
          ]
        },
        {
          onSuccess: () => {
            message.success("Товар добавлен в корзину");
          },
          onError: (error: any) => {
            console.error('Cart error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || "Ошибка при добавлении в корзину";
            message.error(errorMessage);
          }
        }
      );
    } catch (error: any) {
      console.error('Cart mutation error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Ошибка при добавлении в корзину";
      message.error(errorMessage);
    }
  };

  const decriment = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };
  
  const incriment = () => {
    if (count < 100) {
      setCount(count + 1);
    }
  };
  
  // Безопасный расчет скидки
  const safePrice = typeof data?.price === 'number' && data.price > 0 ? data.price : 0;
  const safeDiscountedPrice = typeof data?.discountedPrice === 'number' && data.discountedPrice > 0 ? data.discountedPrice : safePrice;
  const finalPrice = safeDiscountedPrice !== safePrice && safePrice > 0 
    ? Math.round(100 - (safeDiscountedPrice * 100) / safePrice) 
    : null;
  return (
    <Container title={data?.product_Name || ""} backwardUrl={-1}>
      {isFetching || isLoading ? (
        <UserSingleProductSkeleton />
      ) : (
        <div className="flex flex-col gap-3">
          {data?.quantity === 0 && (
            <Alert message="Этот товар доступен " type="error" showIcon />
          )}

          <div className=" flex h-fit w-full items-center justify-center ">
            <Carousel className="h-full w-full" rootClassName="w-full h-full">
              {(data?.photos || []).map((img) => (
                // <div
                //   className="bg-conver h-full w-full"
                //   style={{ backgroundImage: `url("${img}")` }}
                // />
                <Image
                  src={`${import.meta.env.VITE_API_URL}/${img}`}
                  alt={data?.product_Name}
                  className="h-full w-full rounded-lg"
                  preview
                  fallback="data:image/png;base64,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"
                />
              ))}
            </Carousel>
          </div>
          <div className=" my-6 text-right">{data?.product_Name}</div>
          <div className="flex w-full flex-row-reverse items-center justify-start gap-3">
            {finalPrice && (
              <span className="rounded-lg  bg-red-700/50 p-2">
                {finalPrice} %
              </span>
            )}

            <div
              className={`flex flex-row items-center gap-2 self-end text-right ${
                finalPrice && " text-gray-500 line-through"
              }`}>
              <span>руб</span> <span>{addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice}</span>
            </div>
            {finalPrice && (
              <div className="flex flex-row items-center gap-2 self-end text-right">
                <span>руб</span>{" "}
                <span>{addCommas && typeof addCommas === 'function' ? addCommas(safeDiscountedPrice) : safeDiscountedPrice}</span>
              </div>
            )}
          </div>
          <div className="my-4 flex flex-col gap-2">
            <div className="flex w-44 items-center justify-center gap-2">
              <Button
                htmlType="button"
                type="primary"
                ghost
                className="flex h-full w-10 items-center justify-center rounded-l-lg bg-gray-300"
                onClick={incriment}>
                <PlusOutlined />
              </Button>
              <InputNumber
                controls={false}
                className="text-center"
                min={1}
                max={100}
                maxLength={3}
                onChange={(e) => {
                  if (e >= 1) {
                    console.log(e);
                    setCount(e);
                  }
                }}
                onBlur={(e) => {
                  if (e >= 1) {
                    console.log(e);
                    setCount(e);
                  }
                }}
                value={count}
              />
              <Button
                htmlType="button"
                type="primary"
                ghost
                className="flex h-full w-10 items-center justify-center rounded-r-lg bg-gray-300"
                onClick={decriment}>
                <MinusOutlined />
              </Button>
            </div>
            <Button
              className="w-full"
              disabled={data?.quantity === 0}
              loading={mutation.isLoading}
              onClick={handleAddToCart}
              size="large"
              type="primary"
              icon={<ShoppingCartOutlined />}
              ghost>
              Добавить в корзину
            </Button>
          </div>
          <div>
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Описание",
                  children: (
                    <p
                      style={{ whiteSpace: "pre-line" }}
                      className="text-right">
                      {data?.description}
                    </p>
                  )
                }
              ]}
              onChange={onChange}
            />
          </div>
        </div>
      )}
    </Container>
  );
}
export default ProductSingle;
