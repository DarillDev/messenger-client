import { IUserDto } from './user-dto.interface';

export interface IUserDetailsDto extends IUserDto {
  email: string;
  phone: string;
  location: string;
  stats: {
    contacts: number;
    chats: number;
    messages: number;
  };
}
