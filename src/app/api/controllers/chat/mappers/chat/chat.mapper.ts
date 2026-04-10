import { IUserDto } from '@shared/dtos/user-dto.interface';
import { IChat } from '@shared/interfaces/chat.interface';
import { IUser } from '@shared/interfaces/user.interface';

import { IChatDto } from '../../dtos/chat-dto.interface';
import { MessageMapper } from '../message/message.mapper';

export class ChatMapper {
  public static fromDto(dto: IChatDto): IChat {
    return {
      id: dto.id,
      participant: ChatMapper.userFromDto(dto.participant),
      lastMessage: MessageMapper.fromDto(dto.lastMessage),
      updatedAt: new Date(dto.updatedAt),
      unreadCount: dto.unreadCount,
    };
  }

  private static userFromDto(dto: IUserDto): IUser {
    return {
      userId: dto.userId,
      userName: dto.userName,
      isOnline: dto.isOnline,
    };
  }
}
