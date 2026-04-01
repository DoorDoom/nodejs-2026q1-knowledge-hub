import { UserRole } from '../entities/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Login must be string' })
  @IsNotEmpty({ message: 'Login cannot be empty' })
  login: string;
  @IsString({ message: 'Password must be string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
  role?: UserRole;
}
