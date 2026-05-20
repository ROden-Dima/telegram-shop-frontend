/* eslint-disable implicit-arrow-linebreak */
import { TypeListProducts } from "@framework/types";
import { useQuery } from "@tanstack/react-query";
import qs from "query-string";

import Api from "../utils/api-config";

interface Props {
  name?: string;
  sortBy?: "Product_Name" | "Updated_At" | "Price";
  order?: "asc" | "desc";
  limit?: number;
  page?: number;
  categoryId?: number;
}
const fetch = async ({ queryKey }: any) => {
  const [_key, categoryId, limit, name, order, page, sortBy] = queryKey;
  try {
    const { data } = await Api.get(
      `/products?${qs.stringify({
        categoryId,
        limit,
        name,
        order,
        page,
        sortBy
      })}`
    );
    // Если API возвращает массив напрямую, обернуть в объект
    if (Array.isArray(data)) {
      return {
        page: page || 1,
        limit: limit || data.length,
        totalRows: data.length,
        products: data
      } as TypeListProducts;
    }
    // Если products отсутствует, вернуть пустой массив
    if (data && !data.products) {
      return {
        page: data.page || page || 1,
        limit: data.limit || limit || 0,
        totalRows: data.totalRows || 0,
        products: []
      } as TypeListProducts;
    }
    // Проверка на наличие products в ответе
    if (data && data.products) {
      return data as TypeListProducts;
    }
    // Если данных нет, вернуть пустой объект
    return {
      page: page || 1,
      limit: limit || 0,
      totalRows: 0,
      products: []
    } as TypeListProducts;
  } catch (error) {
    // В случае ошибки вернуть пустой объект
    return {
      page: page || 1,
      limit: limit || 0,
      totalRows: 0,
      products: []
    } as TypeListProducts;
  }
};

export const useGetProducts = ({
  categoryId,
  limit = 10,
  name,
  order,
  page = 1,
  sortBy = "Price"
}: Props) =>
  useQuery<TypeListProducts>(
    ["products", categoryId, limit, name, order, page, sortBy],
    fetch
  );
