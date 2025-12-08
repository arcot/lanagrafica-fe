import { getTotalAvailableCards } from "@/api/cardService";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import type { CardStats } from "@/types/api.types";

/**
 * React Query hook to fetch card statistics
 * Fetches available cards count only
 */
export function useCardStatsQuery() {
  const { getAccessToken, isAuthenticated, isAdmin, isStaff } = useAuth();

  return useQuery({
    queryKey: ["card-stats"],
    queryFn: async (): Promise<CardStats> => {
      const token = await getAccessToken();

      // Only fetch available cards count
      const available = await getTotalAvailableCards(token);

      return {
        total: 0, // Not needed
        available,
        assigned: 0, // Not needed
      };
    },
    enabled: isAuthenticated && (isAdmin || isStaff),
    // Refetch every 30 seconds to keep stats fresh
    refetchInterval: 30000,
    // Keep previous data while refetching for smoother UX
    placeholderData: (previousData) => previousData,
  });
}
