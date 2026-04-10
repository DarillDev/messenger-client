import { IMessage } from '@shared/interfaces/message.interface';

export interface IDateDividerItem {
  type: 'divider';
  id: string;
  date: string;
}

export type TMessageListItem = (IMessage & { type: 'message' }) | IDateDividerItem;
