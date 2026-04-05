import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Login must be string' })
  @IsNotEmpty({ message: 'Login cannot be empty' })
  @ApiProperty({
    description: 'User login (username or email)',
    example: 'john_doe',
  })
  login: string;
  @IsString({ message: 'Password must be string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @ApiProperty({
    description: 'User password',
    example: 'StrongP@ssw0rd',
  })
  password: string;
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Role assigned to the user',
    enum: UserRole,
    example: UserRole.VIEWER,
  })
  role?: UserRole;
}
