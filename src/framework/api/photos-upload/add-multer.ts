import Api from "../utils/api-config";

const useUploadImageMulter = () => {
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await Api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      throw error;
    }
  };

  return { uploadImage };
};

export default useUploadImageMulter;