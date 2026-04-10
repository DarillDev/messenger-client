import { IUserDetailsDto } from '@shared/dtos/user-details-dto.interface';
import { IUserDto } from '@shared/dtos/user-dto.interface';
import { IUserDetails } from '@shared/interfaces/user-details.interface';
import { IUser } from '@shared/interfaces/user.interface';

export class UserMapper {
  public static fromDto(dto: IUserDto): IUser {
    return {
      userId: dto.userId,
      userName: dto.userName,
      isOnline: dto.isOnline,
    };
  }

  public static fromDetailsDto(dto: IUserDetailsDto): IUserDetails {
    return {
      userId: dto.userId,
      userName: dto.userName,
      isOnline: dto.isOnline,
      email: dto.email,
      phone: dto.phone,
      location: dto.location,
      stats: {
        contacts: dto.stats.contacts,
        chats: dto.stats.chats,
        messages: dto.stats.messages,
      },
    };
  }
}
