import { IUserDto } from '@shared/dtos/user-dto.interface';
import { IMessageDto } from './message-dto.interface';

export interface IChatDto {
  id: string;
  participant: IUserDto;
  lastMessage: IMessageDto;
  updatedAt: string;
  unreadCount: number;
}
