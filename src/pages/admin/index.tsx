import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function Admin() {
  // const tgApp = useTelegram();

  // const userId = tgApp.initDataUnsafe.user.id;
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      Меню Администратор
      {/*
      <MainButtonDemo />
      <BackButtonDemo />
      <ShowPopupDemo />
      <HapticFeedbackDemo /> */}
      <Button onClick={() => navigate("/admin/products")}>Товары</Button>
      <Button onClick={() => navigate("/admin/categories")}>
        Категории
      </Button>
      <Button onClick={() => navigate("/admin/orders")}>Заказы Пользователи</Button>
      {/* <Button onClick={() => navigate("/admin/discounts")}> Скидкаы </Button> */}
      <Button onClick={() => navigate("/admin/slider")}>Слайдер </Button>
    </div>
  );
}

export default Admin;
