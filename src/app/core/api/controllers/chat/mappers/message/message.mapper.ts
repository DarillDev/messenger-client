import { IMessage } from '@shared/interfaces/message.interface';

import { IMessageDto } from '../../dtos/message-dto.interface';

export class MessageMapper {
  public static fromDto(dto: IMessageDto): IMessage {
    return {
      id: dto.id,
      chatId: dto.chatId,
      senderId: dto.senderId,
      text: dto.text,
      createdAt: new Date(dto.createdAt),
    };
  }
}
