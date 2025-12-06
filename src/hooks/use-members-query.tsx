import { searchMember } from "@/api/memberService";
import { extendWithStatus } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";

export function useMembersQuery(
  debouncedSearch: string | null,
  membersPerPage: number,
) {
  const { getAccessToken, isAuthenticated, isAdmin } = useAuth();

  async function fetchMembers({ pageParam }: { pageParam: number }) {
    const token = await getAccessToken();
    const data = await searchMember(
      debouncedSearch, 
      pageParam, 
      membersPerPage, 
      token
    ) || [];
    return extendWithStatus(data);
  }

  return useInfiniteQuery({
    queryKey: ["members", debouncedSearch],
    queryFn: fetchMembers,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === membersPerPage ? lastPageParam + 1 : null,
    initialPageParam: 0,
    enabled: isAuthenticated && isAdmin, // Only fetch when authenticated and admin
  });
}
