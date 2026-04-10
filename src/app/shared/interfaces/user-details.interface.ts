import { IUser } from './user.interface';

export interface IUserDetails extends IUser {
  email: string;
  phone: string;
  location: string;
  stats: {
    contacts: number;
    chats: number;
    messages: number;
  };
}
