import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { genSaltSync, hashSync } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from 'generated/prisma/client';

type Response = Omit<User, 'password' | 'refreshToken'>;

@Injectable()
export class AuthService {
  response = {
    id: true,
    login: true,
    createdAt: true,
    updatedAt: true,
    role: true,
    articles: true,
    refreshToken: false,
  };

  constructor(private prisma: PrismaService) {}

  generatePasswordHash(password: string): string {
    const saltRounds = process.env.SALT_ROUNDS
      ? parseInt(process.env.SALT_ROUNDS)
      : 10;
    const salt = genSaltSync(saltRounds);
    return hashSync(password, salt);
  }

  async updateTokens(user: User) {
    const accessToken = sign(
      { userId: user.id, login: user.login, role: user.role.toLowerCase() },
      process.env.JWT_SECRET_KEY || 'secret',
      { expiresIn: process.env.TOKEN_EXPIRE_TIME || '15m' },
    );

    const refreshToken = sign(
      { userId: user.id, login: user.login, role: user.role.toLowerCase() },
      process.env.JWT_SECRET_REFRESH_KEY || 'secret',
      { expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME || '7d' },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  async create(data: Prisma.UserCreateInput): Promise<Response> {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: this.generatePasswordHash(data.password),
        },
        select: this.response,
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'User with this login already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      throw error;
    }
  }

  async login(data: Prisma.UserCreateInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        login: data.login,
      },
    });
    if (!user) {
      throw new HttpException(
        'Invalid login or password',
        HttpStatus.FORBIDDEN,
      );
    }
    const isPasswordValid =
      hashSync(data.password, user.password) === user.password;
    if (!isPasswordValid) {
      throw new HttpException(
        'Invalid login or password',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.updateTokens(user);
  }

  async refresh(data: Prisma.UserUpdateInput) {
    try {
      const user = verify(
        data.refreshToken as string,
        process.env.JWT_SECRET_KEY || 'secret',
      );

      const foundUser = await this.prisma.user.findUnique({
        where: { id: (user as any).userId },
      });

      return await this.updateTokens(foundUser);
    } catch {
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }
  }
}
