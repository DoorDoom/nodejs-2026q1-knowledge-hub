import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdatePasswordDto } from './dto/update-password.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from 'generated/prisma/client';

type Response = Omit<User, 'password' | 'refreshToken'>;

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

  constructor(private prisma: PrismaService) {}

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<Response | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: this.response,
    });
  }

  async findAll(): Promise<Response[]> {
    return this.prisma.user.findMany({
      select: this.response,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<Response> {
    return this.prisma.user.create({
      data,
      select: this.response,
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: UpdatePasswordDto;
  }): Promise<Response> {
    const { where, data } = params;
    const user = await this.prisma.user.findUnique({ where });
    if (!user) throw new NotFoundException('User not found');
    if (user.password !== data.oldPassword)
      throw new ForbiddenException('Unmatched password');
    return this.prisma.user.update({
      data: { password: data.newPassword, updatedAt: new Date() },
      where,
      select: this.response,
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<Response> {
    return this.prisma.user.delete({
      where,
      select: this.response,
    });
  }
}
