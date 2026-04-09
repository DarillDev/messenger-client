import { IMessage } from './message.interface';
import { IUser } from './user.interface';

export interface IChat {
  id: string;
  participant: IUser;
  lastMessage: IMessage;
  updatedAt: Date;
  unreadCount: number;
}
