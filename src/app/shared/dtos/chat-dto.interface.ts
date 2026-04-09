import { IMessageDto } from './message-dto.interface';
import { IUserDto } from './user-dto.interface';

export interface IChatDto {
  id: string;
  participant: IUserDto;
  lastMessage: IMessageDto;
  updatedAt: string;
  unreadCount: number;
}
