import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface UploadImageProps {
  onUploadSuccess: (imageUrl: string) => void;
  productId?: number;
}

const UploadImage = ({ onUploadSuccess }: UploadImageProps) => {
  const props: UploadProps = {
    name: 'image',
    action: 'http://localhost:3001/api/upload',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        const imageUrl = info.file.response.imageUrl;
        message.success(`${info.file.name} загружено успешно`);
        onUploadSuccess(imageUrl);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} не загрузилось`);
      }
    },
    beforeUpload: (file) => {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
      if (!isImage) {
        message.error('Можно загружать только JPG/PNG');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Файл должен быть меньше 5MB');
        return false;
      }
      return true;
    }
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>Загрузить фото</Button>
    </Upload>
  );
};

export default UploadImage;