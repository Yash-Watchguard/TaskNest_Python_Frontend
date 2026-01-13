import { Role } from './user.model';

export type jwt = {
  userId: string;
  role: 'Admin' | 'Manager' | 'Employee';
};
