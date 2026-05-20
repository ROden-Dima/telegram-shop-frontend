export const GetOrderStatus = (e: string) => {
  switch (e) {
    case "Pending":
      return " Ожидает подтверждения ";
    case "Processing":
      return "В процессе ";
    case "Packing":
      return " Упаковывается  ";
    case "CancelledByCustomer":
      return "Отменено клиентом ";
    case "CancelledDueToUnavailability":
      return "Завершено из-за отсутствия 1 или нескольких товаров";
    case "CancelledByAdmin":
      return "Отменено администратором";
    case "Shipped":
      return "Доставлено ";
    default:
      return " Ожидает подтверждения ";
  }
};
