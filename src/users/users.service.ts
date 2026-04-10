import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';
import { ArticlesService } from 'src/articles/articles.service';
import { CommentsService } from 'src/comments/comments.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  users: User[] = [];

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly commentsService: CommentsService,
    private prisma: PrismaService,
  ) {}

  // create(createUserDto: CreateUserDto) {
  //   const user = new User(createUserDto);

  //   this.users.push(user);

  //   return user;
  // }

  // findAll() {
  //   return this.users;
  // }

  // findOne(id: string) {
  //   const user = this.users.find((user) => user.id === id);
  //   if (!user) throw new NotFoundException('User not found');
  //   return user;
  // }

  // update(id: string, updatePasswordDto: UpdatePasswordDto) {
  //   const user = this.users.find((user) => user.id === id);
  //   if (!user) throw new NotFoundException('User not found');
  //   if (user.password !== updatePasswordDto.oldPassword)
  //     throw new ForbiddenException('Unmatched password');
  //   user.password = updatePasswordDto.newPassword;
  //   user.updatedAt = Date.now();
  //   return user;
  // }

  // remove(id: string) {
  //   const user = this.users.findIndex((user) => user.id === id);
  //   if (user === -1) throw new NotFoundException('User not found');
  //   this.commentsService.removeByAuthor(this.users[user].id);
  //   this.articlesService.removeAuthor(this.users[user].id);
  //   return this.users.splice(user, 1);
  // }
}
