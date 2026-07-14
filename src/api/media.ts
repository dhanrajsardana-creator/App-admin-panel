import { api } from "./axios";

export interface UploadMediaResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    mediaType: string;
    url: string;
    mimeType: string;
    [key: string]: any;
  };
}

export const mediaApi = {
  upload: async (file: File): Promise<UploadMediaResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const { data } = await api.post<UploadMediaResponse>(
      "/media/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },
};
