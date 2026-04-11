import { Exclude } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import { randomUUID } from 'crypto';
import { Role } from 'generated/prisma/enums';

export class User {
  id: string;
  login: string;
  @Exclude()
  password: string;
  role: Role;
  createdAt: number;
  updatedAt: number;

  constructor(createUserDto: CreateUserDto) {
    this.id = randomUUID();
    this.login = createUserDto.login;
    this.password = createUserDto.password;
    this.role = createUserDto.role ?? Role.VIEWER;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
}
