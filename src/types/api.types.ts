// REST API Types for Legacy Backend Integration

export interface ApiMember {
  id: string;
  name: string;
  surname: string;
  province: string;
  birthDate: string; // yyyy-MM-dd format
  birthPlace?: string;
  email?: string;
  docType?: string;
  docId?: string;
  cardNumber?: string;
  registrationDate?: string; // yyyy-MM-dd format
  expirationDate?: string; // yyyy-MM-dd format
  note?: string;
  country?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  suspendedTill?: string; // yyyy-MM-dd format
  measure?: string;
}

export interface ApiMemberInsert {
  name: string;
  surname: string;
  province: string;
  birthDate: string;
  birthPlace?: string;
  email?: string;
  docType?: string;
  docId?: string;
  country?: string;
  signature?: string; // Base64 encoded PNG signature (without data:image/png;base64, prefix)
  // Note: cardNumber is auto-assigned by backend
  // Note: note and measure are only used in edit form, not add form
}

export interface ApiMemberUpdate {
  name?: string;
  surname?: string;
  province?: string;
  birthDate?: string;
  birthPlace?: string;
  email?: string;
  docType?: string;
  docId?: string;
  cardNumber?: string;
  expirationDate?: string;
  note?: string;
  country?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  suspendedTill?: string;
  measure?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  content?: T[]; // For paginated responses
  error?: string;
  message?: string;
  code?: number;
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface ApiSearchRequest {
  name?: string;
  surname?: string;
  birthDate?: string | null;
  pageNumber: number;
}

// Member status types (derived from data)
export type MemberStatus =
  | "active"
  | "inactive" 
  | "expired"
  | "suspended"
  | "deleted";

// Extended member type with computed status
export interface ApiMemberExt extends ApiMember {
  status: MemberStatus;
}

// Card Number types (from card-api backend)
export interface CardNumber {
  id: string;
  cardNumber: string;
  insertDate: string; // ISO date string (LocalDateTime from backend)
  dayOfUse: string | null; // ISO date string when assigned, null if unused
  isActive: boolean; // false = available for assignment, true = assigned to member
}

export interface CardPageResponse extends ApiResponse {
  content: CardNumber[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  number: number; // Current page number
  size: number; // Page size
}

export interface CardStats {
  total: number;
  available: number;
  assigned: number;
}