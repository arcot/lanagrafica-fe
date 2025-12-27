import { ApiResponse } from "@/types/types";
import { apiConfig } from "@/lib/api-config";

/**
 * Fetch a PDF file from the file-api
 * @param fileName - The name of the file to fetch (e.g., member ID or full filename)
 * @param isGenericFile - Whether this is a generic file or a member-specific PDF
 * @param token - Auth0 JWT token
 * @returns Blob containing the PDF data
 */
export async function fetchPDF(
  fileName: string,
  isGenericFile: boolean,
  token: string
): Promise<Blob> {
  const response = await fetch(`${apiConfig.fullUrl}/file/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName,
      isGenericFile,
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('PDF not found. The admission form may not have been generated yet.');
    }
    throw new Error(`Failed to fetch PDF: ${response.status}`);
  }

  return await response.blob();
}

/**
 * Upload a file to the file-api
 * @param file - The file to upload
 * @param token - Auth0 JWT token
 */
export async function uploadFile(
  file: File,
  token: string
): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${apiConfig.fullUrl}/file/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Note: Don't set Content-Type for FormData - browser sets it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.status}`);
  }

  return await response.json();
}

/**
 * Construct the PDF filename for a member's admission form
 * Matches the backend format: [registrationDate]name_surname.pdf
 * @param name - Member's first name
 * @param surname - Member's surname
 * @param registrationDate - Member's registration date (yyyy-MM-dd format)
 * @returns Constructed filename
 */
export function constructMemberPDFFilename(
  name: string,
  surname: string,
  registrationDate: string
): string {
  // Replace spaces with underscores (matches legacy FE logic exactly)
  const nameFormatted = name.replace(/ /g, '_');
  const surnameFormatted = surname.replace(/ /g, '_');

  // Format: [registrationDate]name_surname.pdf
  // Example: [2025-12-27]test10a.pdf
  return `[${registrationDate}]${nameFormatted}${surnameFormatted}.pdf`;
}

/**
 * Open a PDF in a new window
 * @param fileName - The name of the file to fetch
 * @param isGenericFile - Whether this is a generic file
 * @param token - Auth0 JWT token
 * @param printMode - If true, opens print dialog automatically
 */
export async function openPDF(
  fileName: string,
  isGenericFile: boolean,
  token: string,
  printMode = false
): Promise<void> {
  try {
    const pdfBlob = await fetchPDF(fileName, isGenericFile, token);
    const pdfUrl = URL.createObjectURL(pdfBlob);

    if (printMode) {
      const pdfWindow = window.open(pdfUrl);
      if (pdfWindow) {
        pdfWindow.onload = () => {
          pdfWindow.print();
        };
      }
    } else {
      window.open(pdfUrl);
    }
  } catch (error) {
    throw error;
  }
}
