/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable indent */
/* eslint-disable object-curly-newline */
// eslint-disable-next-line object-curly-newline
import Container from "@components/container";
import useAddCategories from "@framework/api/categories/add";
import useTelegramUser from "@hooks/useTelegramUser";
import { Button, Form, Input, message } from "antd";
import { useNavigate, useParams } from "react-router";

interface FromProps {
  name: string;
  description?: string;
}

function CategoriesAdd() {
  const [form] = Form.useForm();
  const mutation = useAddCategories();
  const telegramUser = useTelegramUser();
  const id = telegramUser?.id;
  // const { data, refetch, isLoading, isFetching } = useGetCategories();
  // const isLoadCategories = isLoading || isFetching;
  const { parentId } = useParams();
  const navigate = useNavigate();
  return (
    <Container title="Добавить Категория " backwardUrl={-1}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        className="flex  h-full flex-col items-stretch justify-start"
        onFinish={({ name }: FromProps) => {
          // console.log("params", name, parentId);
          mutation.mutate(
            {
              user_id: `${id}`,
              category_name: name,
              parent_id: (parentId && parseInt(parentId)) || null
            },
            {
              onSuccess: () => {
                message.success("Категория ваш с успех сохранить стал");
                form.resetFields();
                navigate("/admin/categories");
              },
              onError: (err) => {
                message.error("Произошла ошибка, пожалуйста, попробуйте через несколько минут");
                console.log(err);
              }
            }
          );
        }}>
        <Form.Item name="name" required label="Имя">
          <Input required />
        </Form.Item>

        {/* <Form.Item name="description" label="Описание">
          <Input.TextArea />
        </Form.Item> */}

        {/* <Form.Item name="categories" label=" Категория родитель или под набор">
          <Cascader
            loading={isLoadCategories}
            disabled={isLoadCategories}
            style={{ width: "100%" }}
            options={data}
            fieldNames={{
              label: "category_Name",
              value: "category_Id",
              children: "children"
            }}
            multiple
            maxTagCount="responsive"
          />
        </Form.Item>
         */}
        {/*
        <Form.Item label="Скидка (руб) " name="quantity">
        <InputNumber className="w-full" type="number" />
      </Form.Item> */}

        <Button
          type="primary"
          loading={mutation.isLoading}
          disabled={mutation.isLoading}
          style={{ width: "100%" }}
          size="large"
          ghost
          className="mt-auto"
          htmlType="submit">
          Сохранить
        </Button>
      </Form>
    </Container>
  );
}

export default CategoriesAdd;
