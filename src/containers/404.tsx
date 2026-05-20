import { Button, Divider } from "antd";
import { useNavigate } from "react-router";

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex h-[88vh] flex-col justify-center gap-10 rounded-lg  border-[1px] border-[var(--tg-theme-button-color)] p-3 py-6">
      <div className="text-[50px]">404</div>
      <Divider />
      <div>Ой, похоже ты попал не туда, можешь легко вернуться на главную страницу</div>
      <Button onClick={() => navigate("/")}> Назад</Button>
    </div>
  );
}

export default NotFoundPage;
