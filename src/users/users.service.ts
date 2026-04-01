import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  users: User[] = [];

  create(createUserDto: CreateUserDto) {
    const user = new User(createUserDto);

    this.users.push(user);

    return user;
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    const user = this.users.find((user) => user.id === id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  update(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = this.users.find((user) => user.id === id);
    if (!user) throw new NotFoundException('User not found');
    if (user.password !== updatePasswordDto.oldPassword)
      throw new ForbiddenException('Unmatched password');
    user.password = updatePasswordDto.newPassword;
    return user;
  }

  remove(id: string) {
    const user = this.users.findIndex((user) => user.id === id);
    if (user === -1) throw new NotFoundException('User not found');
    return this.users.splice(
      this.users.findIndex((user) => user.id === id),
      1,
    );
  }
}
