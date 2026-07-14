import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { mediaApi, type UploadMediaResponse } from "@/api/media";

export function useUploadMedia() {
  return useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: () => {
      toast.success("Media uploaded successfully");
    },
    onError: (e: { message?: string }) => {
      toast.error(e.message ?? "Failed to upload media");
    },
  });
}
