import { getCardsByFilter } from "@/api/cardService";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * React Query hook for fetching cards with infinite scroll
 * @param filter - "available" (only available cards) or "all" (all cards)
 * @param cardsPerPage - Number of cards to fetch per page (default: 20)
 */
export function useCardsQuery(
  filter: "available" | "all" = "available",
  cardsPerPage: number = 20
) {
  const { getAccessToken, isAuthenticated, isAdmin, isStaff } = useAuth();

  return useInfiniteQuery({
    queryKey: ["cards", filter],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const token = await getAccessToken();
      const response = await getCardsByFilter(filter, pageParam, token);
      return response.content || [];
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // Continue fetching if we got a full page
      return lastPage.length === cardsPerPage ? lastPageParam + 1 : null;
    },
    initialPageParam: 0,
    enabled: isAuthenticated && (isAdmin || isStaff),
  });
}
