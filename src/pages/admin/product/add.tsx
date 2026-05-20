/* eslint-disable no-unused-expressions */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable camelcase */
import Container from "@components/container";
import SimpleUpload from "@components/SimpleUpload";
import { useGetCategories } from "@framework/api/categories/get";
import useAddProduct from "@framework/api/product/add";
import { TypeProductPost } from "@framework/types";
import useTelegramUser from "@hooks/useTelegramUser";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  TreeSelect
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const { TextArea } = Input;

function Add() {
  const {
    data: categoriesData,
    isLoading: isCatLoading,
    refetch: catRefetch,
    isFetching: isCatFetching
  } = useGetCategories({});
  
  const mutation = useAddProduct();
  const telegramUser = useTelegramUser();
  const id = telegramUser?.id;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  useEffect(() => {
    catRefetch();
  }, []);

  const [imageLinkList, setImageLinkList] = useState<Array<string>>([]);

  const handleImageUpload = (imageUrl: string) => {
    setImageLinkList(prev => [...prev, imageUrl]);
  };

  const handleRemoveSingleImage = (idx: number) => {
    const arr = [...imageLinkList];
    arr.splice(idx, 1);
    setImageLinkList(arr);
  };

  const onFinishHandler = (values: TypeProductPost) => {
    const { category_ids, description, price, product_name, quantity } = values;
    
    mutation.mutate(
      {
        category_ids: typeof category_ids === "number" ? [category_ids] : category_ids || [],
        description,
        photos: imageLinkList || [],
        price,
        product_name,
        quantity,
        user_id: id?.toString() || ""
      },
      {
        onSuccess: () => {
          message.success("Товар успешно сохранён");
          form.resetFields();
          setImageLinkList([]);
          navigate("/admin/products");
        },
        onError: (err) => {
          message.error(err?.response?.data?.title || "Ошибка сохранения");
        }
      }
    );
  };

  return (
    <Container backwardUrl={-1} title="Добавить новый товар">
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        onFinish={onFinishHandler}>
        
        <Form.Item name="product_name" required label="Название товара">
          <Input required />
        </Form.Item>
        
        <Form.Item name="category_ids" label="Категория">
          <TreeSelect
            showSearch
            showCheckedStrategy="SHOW_PARENT"
            treeData={categoriesData}
            loading={isCatLoading || isCatFetching}
            onChange={(e) => console.log(e)}
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

        <Button
          type="primary"
          style={{ width: "100%" }}
          size="large"
          ghost
          loading={mutation.isLoading}
          htmlType="submit">
          Сохранить
        </Button>
      </Form>
    </Container>
  );
}

export default Add;