import { restClient } from "./restClient";
import { extendDate, genCardNumber } from "@/lib/utils";
import { MemberInsert, MemberUpdate, Member, ApiResponse, ApiSearchRequest } from "@/types/types";

function serialize<T extends MemberUpdate | MemberInsert>(data: T) {
  const serialized = Object.entries(data).map((item) => {
    item[1] = item[1] === "" ? undefined : item[1];
    return item;
  });

  return Object.fromEntries(serialized) as T;
}

export async function renewMember(id: string, expirationDate: string, token: string) {
  const cardNumber = genCardNumber();
  const nextExpiration = extendDate(expirationDate);

  const updateData: MemberUpdate = {
    cardNumber: String(cardNumber),
    expirationDate: nextExpiration,
    isActive: true,
  };

  const response = await restClient.put<ApiResponse<Member>>(
    `/member/${id}`,
    serialize(updateData),
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
}

export async function updateMember(id: string, details: MemberUpdate, token: string) {
  const response = await restClient.put<ApiResponse<Member>>(
    `/member/${id}`,
    serialize(details),
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
}

export async function insertMember(details: MemberInsert, token: string) {
  const response = await restClient.post<ApiResponse<Member>>(
    `/member`,
    serialize(details),
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
}

export async function searchMember(
  debouncedSearch: string | null,
  pageNumber: number,
  pageSize: number,
  token: string
): Promise<Member[]> {
  if (debouncedSearch) {
    // Use search endpoint for text search
    const searchWords = debouncedSearch.trim().split(/\s+/).filter(Boolean);
    const searchRequest: ApiSearchRequest = {
      name: searchWords[0],
      surname: searchWords[1] || searchWords[0], // Use first word for both if only one word
      pageNumber,
      pageSize,
    };

    const response = await restClient.post<ApiResponse<Member[]>>(
      `/member/getMembers`,
      searchRequest,
      token
    );

    if (response.error) {
      throw new Error(response.error);
    }

    // Handle both paginated (content) and direct array responses
    if (Array.isArray(response)) {
      return response as unknown as Member[];
    }
    if (response.content && Array.isArray(response.content)) {
      return response.content as unknown as Member[];
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data as unknown as Member[];
    }
    return [] as Member[];
  } else {
    // Use all members endpoint
    const response = await restClient.get<ApiResponse<Member[]>>(
      `/member/all/${pageNumber}`,
      token
    );

    if (response.error) {
      throw new Error(response.error);
    }

    // Handle both paginated (content) and direct array responses
    if (Array.isArray(response)) {
      return response as unknown as Member[];
    }
    if (response.content && Array.isArray(response.content)) {
      return response.content as unknown as Member[];
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data as unknown as Member[];
    }
    return [] as Member[];
  }
}

// Additional REST API functions
export async function getAllMembers(pageNumber: number, token: string): Promise<Member[]> {
  const response = await restClient.get<ApiResponse<Member[]>>(
    `/member/all/${pageNumber}`,
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  // Handle both paginated (content) and direct array responses
  if (Array.isArray(response)) {
    return response as unknown as Member[];
  }
  if (response.content && Array.isArray(response.content)) {
    return response.content as unknown as Member[];
  }
  if (response.data && Array.isArray(response.data)) {
    return response.data as unknown as Member[];
  }
  return [] as Member[];
}

export async function getActiveMembers(pageNumber: number, token: string): Promise<Member[]> {
  const response = await restClient.get<ApiResponse<Member[]>>(
    `/member/active/${pageNumber}`,
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  // Handle both paginated (content) and direct array responses
  if (Array.isArray(response)) {
    return response as unknown as Member[];
  }
  if (response.content && Array.isArray(response.content)) {
    return response.content as unknown as Member[];
  }
  if (response.data && Array.isArray(response.data)) {
    return response.data as unknown as Member[];
  }
  return [] as Member[];
}

export async function getInactiveMembers(pageNumber: number, token: string): Promise<Member[]> {
  const response = await restClient.get<ApiResponse<Member[]>>(
    `/member/inactive/${pageNumber}`,
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  // Handle both paginated (content) and direct array responses
  if (Array.isArray(response)) {
    return response as unknown as Member[];
  }
  if (response.content && Array.isArray(response.content)) {
    return response.content as unknown as Member[];
  }
  if (response.data && Array.isArray(response.data)) {
    return response.data as unknown as Member[];
  }
  return [] as Member[];
}

export async function getDeletedMembers(pageNumber: number, token: string): Promise<Member[]> {
  const response = await restClient.get<ApiResponse<Member[]>>(
    `/member/deleted/${pageNumber}`,
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  // Handle both paginated (content) and direct array responses
  if (Array.isArray(response)) {
    return response as unknown as Member[];
  }
  if (response.content && Array.isArray(response.content)) {
    return response.content as unknown as Member[];
  }
  if (response.data && Array.isArray(response.data)) {
    return response.data as unknown as Member[];
  }
  return [] as Member[];
}

export async function deleteMember(id: string, token: string): Promise<void> {
  const response = await restClient.delete<ApiResponse>(
    `/member/soft-delete/${id}`,
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }
}
