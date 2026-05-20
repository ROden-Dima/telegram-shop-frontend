import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface SimpleUploadProps {
  onUploadSuccess: (url: string) => void;
}

const SimpleUpload = ({ onUploadSuccess }: SimpleUploadProps) => {
  const props: UploadProps = {
    name: 'image',
    action: 'http://localhost:3001/api/upload',
    showUploadList: false,
    onChange(info) {
      console.log('Upload onChange:', info.file.status, info.file);
      if (info.file.status === 'done') {
        const imageUrl = info.file.response.imageUrl;
        console.log('Фото загружено, URL:', imageUrl);
        message.success('Фото загружено');
        onUploadSuccess(imageUrl);
      } else if (info.file.status === 'error') {
        console.error('Ошибка загрузки:', info.file.error);
        message.error('Ошибка загрузки фото');
      }
    },
    beforeUpload(file) {
      console.log('Before upload:', file.name, file.type, file.size);
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Можно загружать только изображения');
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
      <Button icon={<UploadOutlined />}>Добавить фото</Button>
    </Upload>
  );
};

export default SimpleUpload;