import { restClient } from "./restClient";
import { apiConfig } from "@/lib/api-config";
import { CardPageResponse } from "@/types/api.types";

/**
 * Get total available cards count
 * Note: Backend returns plain number (not JSON), so we use fetch directly
 */
export async function getTotalAvailableCards(token: string): Promise<number> {
  const url = `${apiConfig.fullUrl}/cardNumber/totalAvailable`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch available cards count: ${response.status}`);
  }

  // Backend returns plain number as text, not JSON
  const text = await response.text();
  return parseInt(text, 10);
}

/**
 * Get cards by filter with pagination
 * @param filter - "available" or "all"
 * @param pageNumber - Page number (0-indexed)
 */
export async function getCardsByFilter(
  filter: "available" | "all",
  pageNumber: number,
  token: string
): Promise<CardPageResponse> {
  const response = await restClient.get<CardPageResponse>(
    `/cardNumber/${filter}/${pageNumber}`,
    token
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response;
}

/**
 * Upload Excel file and import card numbers (combined operation)
 * Step 1: Upload file to file-api (stores in MongoDB GridFS)
 * Step 2: Import cards from uploaded file via card-api
 */
export async function uploadAndImportCards(
  file: File,
  token: string
): Promise<{ message: string }> {
  try {
    // Step 1: Upload file to file-api
    const formData = new FormData();
    formData.append("file", file);

    const uploadUrl = `${apiConfig.fullUrl}/file/upload`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(errorData.error || errorData.message || "Failed to upload file");
    }

    // Step 2: Import cards from uploaded file
    const importResponse = await restClient.post<{ message: string }>(
      `/cardNumber/`,
      {},
      token
    );

    return importResponse;
  } catch (error) {
    console.error("Upload and import failed:", error);
    throw error;
  }
}
