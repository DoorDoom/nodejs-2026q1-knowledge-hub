import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'User password',
    example: 'StrongP@ssw0rd',
  })
  @IsString({ message: 'Old password must be string' })
  @IsNotEmpty({ message: 'Old password cannot be empty' })
  oldPassword: string;

  @ApiProperty({
    description: 'New user password',
    example: 'StrongP@ssw0rdYes',
  })
  @IsString({ message: 'New password must be string' })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  newPassword: string;
}
