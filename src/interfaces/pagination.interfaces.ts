import { UserStatusEnum } from 'src/common/enums/enums';

export interface RoleListItem {
  id: string;
  name: string;
  role_key: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  status: UserStatusEnum;
  avatar: string;
  role: RoleListItem;
  created_at: Date;
  updated_at: Date;
}

export interface PaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResult<T> {
  results: T[];
  pagination: PaginationMeta | null;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  hasPagination?: boolean;
}

export interface UserListResponse<T> {
  results: T[];
  pagination: PaginationMeta | null;
}
