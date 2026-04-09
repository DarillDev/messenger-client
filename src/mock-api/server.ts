import { Body, Controller, HttpCode, Module, Post, UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NestFactory } from '@nestjs/core';

const JWT_SECRET = 'mock-secret-key-for-dev-only';
const ACCESS_TOKEN_TTL = '1h';
const REFRESH_TOKEN_TTL = '7d';

interface IUser {
  userId: string;
  userName: string;
  password: string;
  isOnline: boolean;
}

const users: IUser[] = [
  { userId: 'u1', userName: 'Stepan', password: 'pass123', isOnline: true },
  { userId: 'u2', userName: 'Alex', password: 'pass123', isOnline: true },
  { userId: 'u3', userName: 'Maria', password: 'pass123', isOnline: false },
  { userId: 'u4', userName: 'Denis', password: 'pass123', isOnline: true },
  { userId: 'u5', userName: 'Olga', password: 'pass123', isOnline: false },
];

@Controller('api/auth')
class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  @HttpCode(200)
  public login(@Body() body: { userName: string; password: string }): {
    accessToken: string;
    refreshToken: string;
    user: Omit<IUser, 'password'>;
  } {
    const user = users.find(u => u.userName === body.userName && u.password === body.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.userId, userName: user.userName };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_TTL }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_TTL }),
      user: {
        userId: user.userId,
        userName: user.userName,
        isOnline: user.isOnline,
      },
    };
  }

  @Post('refresh')
  @HttpCode(200)
  public refresh(@Body() body: { refreshToken: string }): {
    accessToken: string;
    refreshToken: string;
  } {
    try {
      const decoded = this.jwtService.verify<{ userId: string; userName: string }>(
        body.refreshToken,
      );

      const user = users.find(u => u.userId === decoded.userId);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const payload = { userId: user.userId, userName: user.userName };

      return {
        accessToken: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_TTL }),
        refreshToken: this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_TTL }),
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
  ],
  controllers: [AuthController],
})
class AppModule {}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Mock API running on http://localhost:3000');
}

bootstrap();
