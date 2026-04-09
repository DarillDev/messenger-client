import { IUserDto } from '@shared/dtos/user-dto.interface';

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUserDto;
}
