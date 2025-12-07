import { uploadAndImportCards } from "@/api/cardService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * React Query mutation hook for uploading and importing card numbers
 * Combines file upload + import into single operation
 */
export function useCardUploadMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { getAccessToken } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const token = await getAccessToken();
      return uploadAndImportCards(file, token);
    },
    onSuccess: (response) => {
      // Invalidate stats and cards queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["card-stats"] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });

      // Extract count from message if available (e.g., "Imported 125 cards successfully")
      const message = response.message || t("cards.importSuccess");
      toast.success(message);
    },
    onError: (error: Error) => {
      console.error("Card import error:", error);
      toast.error(t("cards.importError", { error: error.message }));
    },
  });
}
