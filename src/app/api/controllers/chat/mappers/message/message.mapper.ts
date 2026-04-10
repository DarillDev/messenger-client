import { IMessageDto } from '@shared/dtos/message-dto.interface';
import { IMessage } from '@shared/interfaces/message.interface';

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
