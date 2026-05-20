/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line object-curly-newline
import { Order } from "@framework/types";
import { addCommas } from "@persian-tools/persian-tools";
import { Divider, List } from "antd";
import { Link } from "react-router-dom";

interface Props {
  loading: boolean;
  orders: Order | undefined;
}

function OrderList({ loading, orders }: Props) {
  return (
    <>
      <List
        loading={loading}
        itemLayout="horizontal"
        // loadMore={loadMore}
        dataSource={orders?.order_Items}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <Link to={`/products/${item.product_Id}`}>
                  Название товара :
                  <br />
                  {item.product_Name}
                </Link>
              }
            />

            <div className="flex flex-col gap-3  ">
              <div className="flex flex-row-reverse gap-1">
                <span>руб</span>
                <span>{addCommas(item.final_Price)}</span>
                <span> Цена за единицу :</span>
              </div>
              <div className="flex flex-row-reverse gap-1">
                <span>шт</span>
                <span>{item.quantity}</span>
                <span> Количество :</span>
              </div>

              <div className="flex flex-row-reverse gap-1">
                <span>руб</span>
                <span>{addCommas(item.final_Price * item.quantity)}</span>
                <span> Итого :</span>
              </div>
            </div>
          </List.Item>
        )}
      />
      <Divider> Итого Цена </Divider>
      <div>
        <span>{addCommas(orders?.total_Price || 0)}</span> <span>руб</span>
      </div>
    </>
  );
}

export default OrderList;
