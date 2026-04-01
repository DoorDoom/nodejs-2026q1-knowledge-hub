import { Exclude } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import { randomUUID } from 'crypto';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class User {
  id: string;
  login: string;
  @Exclude()
  password: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;

  constructor(createUserDto: CreateUserDto) {
    this.id = randomUUID();
    this.login = createUserDto.login;
    this.password = createUserDto.password;
    this.role = createUserDto.role ?? UserRole.VIEWER;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
}
