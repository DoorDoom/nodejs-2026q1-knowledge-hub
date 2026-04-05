import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'User password',
    example: 'StrongP@ssw0rd',
  })
  oldPassword: string;
  @ApiProperty({
    description: 'New user password',
    example: 'StrongP@ssw0rdYes',
  })
  newPassword: string;
}
