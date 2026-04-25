import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdatePasswordDto } from './dto/update-password.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, User } from 'generated/prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { User as ServerUser } from './entities/user.entity';

type Response = Omit<ServerUser, 'password' | 'refreshToken'>;

@Injectable()
export class UsersService {
  response = {
    id: true,
    login: true,
    createdAt: true,
    updatedAt: true,
    role: true,
    articles: true,
    refreshToken: false,
  };

  generatePasswordHash(password: string): string {
    const saltRounds = process.env.SALT_ROUNDS
      ? parseInt(process.env.SALT_ROUNDS)
      : 10;
    const salt = genSaltSync(saltRounds);
    return hashSync(password, salt);
  }

  convertToResponse(user: User): Response {
    return {
      id: user.id,
      login: user.login,
      role: user.role.toLowerCase() as Role,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  constructor(private prisma: PrismaService) {}

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<Response | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
    if (!user) throw new NotFoundException('User not found');
    return this.convertToResponse(user);
  }

  async findAll(): Promise<Response[]> {
    const users = await this.prisma.user.findMany({});
    return users.map((user) => this.convertToResponse(user));
  }

  async create(data: Prisma.UserCreateInput): Promise<Response> {
    const user = await this.prisma.user.findUnique({
      where: data.login ? { login: data.login } : undefined,
    });
    if (user) return this.convertToResponse(user); // For testing purposes, to avoid creating multiple users with the same login

    const createdUser = await this.prisma.user.create({
      data: {
        ...data,
        password: this.generatePasswordHash(data.password),
      },
    });

    return this.convertToResponse(createdUser);
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: UpdatePasswordDto;
  }): Promise<Response> {
    const { where, data } = params;
    const user = await this.prisma.user.findUnique({ where });
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid =
      hashSync(data.oldPassword, user.password) === user.password;

    if (!isPasswordValid) throw new ForbiddenException('Unmatched password');

    const newUser = await this.prisma.user.update({
      data: {
        password: this.generatePasswordHash(data.newPassword),
        updatedAt: new Date(),
      },
      where,
    });

    return this.convertToResponse(newUser);
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<Response> {
    let user = await this.prisma.user.findUnique({
      where,
    });
    if (!user) throw new NotFoundException('User not found');
    user = await this.prisma.user.delete({
      where,
    });
    return this.convertToResponse(user);
  }
}
