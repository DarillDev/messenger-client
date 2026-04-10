import { IMessageDto } from '@shared/dtos/message-dto.interface';
import { IUserDto } from '@shared/dtos/user-dto.interface';

export interface IChatDto {
  id: string;
  participant: IUserDto;
  lastMessage: IMessageDto;
  updatedAt: string;
  unreadCount: number;
}
