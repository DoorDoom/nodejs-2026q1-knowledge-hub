import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAuthDto {
  @IsString({ message: 'refreshToken must be string' })
  @IsNotEmpty({ message: 'refreshToken cannot be empty' })
  @ApiProperty({
    description: 'User refreshToken',
  })
  refreshToken: string;
}
