/* eslint-disable no-unused-expressions */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable camelcase */
import Container from "@components/container";
import SimpleUpload from "@components/SimpleUpload";
import { useGetCategories } from "@framework/api/categories/get";
import useDeleteProduct from "@framework/api/product/delete";
import { useGetProductsById } from "@framework/api/product/get-by-id";
import useUpdateProduct from "@framework/api/product/update";
import { TypeProductPost } from "@framework/types";
import useTelegramUser from "@hooks/useTelegramUser";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Spin,
  TreeSelect
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const { TextArea } = Input;

function Edit() {
  const { product_id } = useParams();
  const {
    data: categoriesData,
    isLoading: isCatLoading,
    refetch: catRefetch,
    isFetching: isCatFetching
  } = useGetCategories({});
  const {
    data: productData,
    isLoading: isProductLoading,
    isFetching: isProductFetching,
    refetch: productRefetch
  } = useGetProductsById({ product_id });
  const mutation = useUpdateProduct({ product_id });
  const telegramUser = useTelegramUser();
  const id = telegramUser?.id;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [imageLinkList, setImageLinkList] = useState<Array<string>>([]);
  const [isMounted, setIsMounted] = useState(false);

  const deleteMutation = useDeleteProduct();

  useEffect(() => {
    setIsMounted(true);
    catRefetch();
    productRefetch();
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (productData?.photos && Array.isArray(productData.photos)) {
      setImageLinkList(productData.photos);
    }
  }, [productData]);

  const handleImageUpload = (imageUrl: string) => {
    setImageLinkList(prev => [...prev, imageUrl]);
  };

  const handleRemoveSingleImage = (idx: number) => {
    const arr = [...imageLinkList];
    arr.splice(idx, 1);
    setImageLinkList(arr);
  };

  const handleDeleteProduct = () => {
    deleteMutation.mutate(
      { product_id, user_id: id },
      {
        onSuccess: () => {
          message.success("Товар успешно удалён");
          navigate("/admin/products");
        },
        onError: () => {
          message.error("Ошибка при удалении товара");
        }
      }
    );
  };

  if (isProductLoading || !isMounted) {
    return (
      <Container backwardUrl="/admin/products" title="Редактирование товара">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Загрузка..." />
        </div>
      </Container>
    );
  }

  return (
    <Container backwardUrl="/admin/products" title="Редактирование товара">
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        initialValues={{
          description: productData?.description,
          product_name: productData?.product_Name,
          price: productData?.price,
          quantity: productData?.quantity,
          category_ids: productData?.categoryIds
        }}
        onFinish={(values: TypeProductPost) => {
          mutation.mutate(
            {
              category_ids:
                typeof values.category_ids === "number"
                  ? [values.category_ids]
                  : values.category_ids || [],
              description: values.description,
              photos: imageLinkList || [],
              price: values.price,
              product_name: values.product_name,
              quantity: values.quantity,
              user_id: id?.toString() || ""
            },
            {
              onSuccess: () => {
                message.success("Товар успешно обновлён");
                navigate("/admin/products");
              },
              onError: (err) => {
                message.error(err?.response?.data?.title || "Ошибка обновления");
              }
            }
          );
        }}>
        
        <Form.Item name="product_name" required label="Название товара">
          <Input required />
        </Form.Item>
        
        <Form.Item name="category_ids" label="Категория">
          <TreeSelect
            showSearch
            showCheckedStrategy="SHOW_PARENT"
            treeData={categoriesData}
            loading={isCatLoading || isCatFetching}
            treeLine
            style={{ width: "100%" }}
            fieldNames={{
              label: "category_Name",
              value: "category_Id",
              key: "category_Id",
              children: "children"
            }}
          />
        </Form.Item>

        <Form.Item label="Цена (₽)" required name="price">
          <InputNumber
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value?.replace(/\$\s?|(,*)/g, "") || ""}
            required
            className="w-1/2"
          />
        </Form.Item>

        <Form.Item label="Количество на складе" required name="quantity">
          <InputNumber required type="number" className="w-1/2" />
        </Form.Item>

        <Form.Item label="Описание" required name="description">
          <TextArea required rows={10} />
        </Form.Item>

        <Form.Item className="mb-14 w-full" label="Фото товара">
          <SimpleUpload onUploadSuccess={handleImageUpload} />
          
          <div className="grid h-[240px] w-full grid-cols-2 gap-3 mt-3 overflow-auto">
            {imageLinkList.map((image, index) => (
              <div key={index} className="relative h-24 w-36 rounded-lg">
                <img
                  src={image}
                  alt=""
                  className="h-full w-full rounded-lg object-cover"
                />
                <Button
                  danger
                  size="small"
                  className="absolute top-1 right-1"
                  onClick={() => handleRemoveSingleImage(index)}>
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </Form.Item>

        <div className="flex gap-3">
          <Popconfirm
            placement="top"
            title="Удалить этот товар?"
            onConfirm={handleDeleteProduct}
            okText="Удалить"
            cancelText="Отменить">
            <Button
              size="large"
              loading={deleteMutation.isLoading}
              style={{ width: "36%" }}
              danger>
              Удалить товар
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            loading={mutation.isLoading}
            style={{ width: "65%" }}
            size="large"
            ghost
            htmlType="submit">
            Сохранить
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default Edit;