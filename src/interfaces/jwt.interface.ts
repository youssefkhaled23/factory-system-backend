import { Request } from 'express';

export interface PAYLOAD {
  sub: string;
  email: string;
  roleId: string;
  lastLoginAt: number;
}

export interface REFRESHPAYLOAD {
  sub: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    roleId?: string;
    lastLoginAt?: number;
  };
}
