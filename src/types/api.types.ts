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
  cardNumber?: string;
  note?: string;
  country?: string;
  measure?: string;
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

export interface ApiResponse<T = any> {
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
  birthDate?: string;
  pageNumber?: number;
  pageSize?: number;
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

// Card Number types
export interface ApiCardNumber {
  id: string;
  cardNumber: string;
  isAvailable?: boolean;
  assignedMemberId?: string;
}