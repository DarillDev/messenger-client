import { IUserDto } from '@shared/dtos/user-dto.interface';
import { IUser } from '@shared/interfaces/user.interface';

export class UserMapper {
  public static fromDto(dto: IUserDto): IUser {
    return {
      userId: dto.userId,
      userName: dto.userName,
      isOnline: dto.isOnline,
    };
  }
}
